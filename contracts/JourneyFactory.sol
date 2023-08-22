/**********************************************************************************************************/
/* JourneyFactory contract to create journeys and sell tickets with a single deployment on the blockchain */
/**********************************************************************************************************/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract JourneyFactory is ERC721, ERC721Enumerable, ERC721Burnable {
    constructor () ERC721 ("Ticket", "TKT") public {}
    
    /**
     * @dev Events
    */
    event JourneyCreated(uint journeyId, address provider, uint startDate, uint endDate, uint ticketPrice, uint timestamp);
    event TicketPurchased(address buyer, uint journeyId, uint ticketId, uint timestamp);
    event JourneyCancelled(uint journeyId, uint timestamp);
    event PaymentCollected(uint journeyId, address provider, uint earnings, uint timestamp);
    event MoneySent(address receiver, uint amount, uint timestamp);

    struct Journey {
        address provider;
        uint startDate;
        uint endDate;
        uint ticketPrice;
        // availability and earnings are stored in database
    }

	/**
     * @dev Creates an array to keep track of all 
     * 		journeys within a single contract
    */
    Journey[] public journeys;

	/**
     * @dev Mappings required for retrieving useful info
	 *
     * journeyToProvider: maps journey ID to provider's address
     * ticketToJourney: maps ticket ID to journey ID
     * ticketToPrice: maps ticket to the price at which it was sold
    */
    mapping (uint => address) journeyToProvider;
    mapping (uint => uint) ticketToJourney;
    mapping (uint => uint) ticketToPrice;

    using Counters for Counters.Counter;

    Counters.Counter private _ticketIdCounter;

	/**
     * @dev The following functions are overrides required by Solidity
    */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

	/**
     * @dev Providers create journeys through this function
     *
     * Requirements:
     * - Correct start and end dates
     * - Ticket availability shouldn't be zero
     * - Ticket price should be a positive number
     *
     * @dev Emits {JourneyCreated} event
    */
    function createJourney(uint _start, uint _end, uint _ticketPrice) public {
        require(block.timestamp < _start && block.timestamp < _end, "Journey cannot start or end in the past.");
        require(_start < _end, "End time cannot be same or earlier than start time.");
        require(_ticketPrice > 0, "Ticket cannot be free.");

        journeys.push(Journey(msg.sender, _start, _end, _ticketPrice));
        journeyToProvider[journeys.length - 1] = msg.sender;
        
        emit JourneyCreated(journeys.length-1, msg.sender, _start, _end, _ticketPrice, block.timestamp);
    }

	/**
     * @dev Cover function for _safeMint that creates tickets and gives them a unique ID
     *
	 * @param to: Address of the person buying the ticket
     *
     * Emits {TicketPurchased} event
	*/
    function safeMint(uint _journeyId, address to, uint _price) internal {
        uint ticketId = _ticketIdCounter.current();
        _ticketIdCounter.increment();
        ticketToJourney[ticketId] = _journeyId;
        ticketToPrice[ticketId] = _price;
        _safeMint(to, ticketId);
        
        emit TicketPurchased(to, _journeyId, ticketId, block.timestamp);
    }

	/**
     * @dev Users buy tickets through this function
     *
     * Requirements:
     * - Journey ID is valid
     * - Journey shouldn't have started already
     * - Enough tickets should be available
     * - Amount sent by buyer should be equal to amount needed
     *
    */
    function buyTicket(uint _journeyId, uint8 _quantity) public payable {
        require(_journeyId < journeys.length, "Journey doesn't exist.");
        require(block.timestamp < journeys[_journeyId].startDate, "Journey started, cannot buy tickets now.");
        require(msg.value >= journeys[_journeyId].ticketPrice * _quantity, "Enter correct amount.");

        for(uint8 i = 0; i < _quantity; i++) {
            safeMint(_journeyId, msg.sender, journeys[_journeyId].ticketPrice);
            // calculate and update earnings in the database
        }
    }

	/**
     * @dev Cancels tickets from a list of ticket IDs provided by the ticket holder
     		Provide an option in UI to "select all tickets to cancel"
     *
     * @notice Tickets that don't exist or are not owned by the caller will not be cancelled
     *
    */
    function cancelTickets(uint[] memory _ticketsToCancel) public {
        // check from database that journey hasn't started yet
        uint quantity = _ticketsToCancel.length;
        uint _ticketId;
        for(uint8 i = 0; i < quantity; i++) {
            _ticketId = _ticketsToCancel[i];
            if(_exists(_ticketId) && ownerOf(_ticketId) == msg.sender) {
                    _burn(_ticketId);
                    sendMoney(msg.sender, ticketToPrice[_ticketId]);
            }
        }
    }

	/**
     * @dev Verifies the ticket and burns it
     *
     * Requirements:
     * - Ticket exists (it was created)
     * - Only journey provider can verify tickets
     * - Journey isn't over
     *
     * @return True/false based on whether ticket is owned by the ticket holder
    */
    function verifyTicket(uint _ticketId, address _ticketHolder) public returns (bool) {
        require(_exists(_ticketId), "Ticket doesn't exist.");
        uint _journeyId = ticketToJourney[_ticketId];
        require(journeys[_journeyId].provider == msg.sender, "Only the provider can verify tickets.");
        require(block.timestamp < journeys[_journeyId].endDate, "Ticket cannot be used now.");

        if(ownerOf(_ticketId) == _ticketHolder) {
            _burn(_ticketId);
            return true;
        }

        return false;
    }

	/**
     * @dev Cancel the journey and refund tickets to all ticket holders
     *
     * Requirements:
     * - Journey ID is valid
     * - Cancellation window is active
     * - Only journey provider can cancel the journey
     * 
     * Emits {JourneyCancelled} event
    */
    function cancelJourney(uint _journeyId) public {
        require(_journeyId < journeys.length, "Journey doesn't exist.");
        require(msg.sender == journeys[_journeyId].provider, "You are not the provider.");
        require(block.timestamp < journeys[_journeyId].startDate, "Journey started, cannot cancel now.");
        uint numTickets = _ticketIdCounter.current();
        for(uint8 i = 0; i < numTickets; i++) {
            if(_exists(i) && _journeyId == ticketToJourney[i]) {
                payable(ownerOf(i)).transfer(ticketToPrice[i]);
                _burn(i);
            }
        }
        
        emit JourneyCancelled(_journeyId, block.timestamp);
    }

	/**
     * @dev Get a list of all the tickets owned by a user/address
     *
     * @param _ticketHolder: The address whose tickets are to be shown
     *
     * @return A list containing all the ticket IDs of the ticket holder
    */
    function getAllOwnedTickets(address _ticketHolder) public view returns (uint[] memory ) {
        uint numTickets = balanceOf(_ticketHolder);
        uint[] memory ticketsOfOwner = new uint[](numTickets);

        for(uint8 i = 0; i < numTickets; i++) {
            ticketsOfOwner[i] = tokenOfOwnerByIndex(_ticketHolder, i);
        }

        return ticketsOfOwner;
    }

	/**
     * @dev Journey provider can collect payment for the journey by calling this function
     *
     * Requirements:
     * - Journey ID is valid
     * - Only journey provider can collect payment
     * - Journey should've completed
     *
     * @dev Emits {PaymentCollected} event
    */
    function collectPayment(uint _journeyId, uint _amount) public {
    	require(_journeyId < journeys.length, "Journey doesn't exist.");
        require(msg.sender == journeys[_journeyId].provider, "You are not the provider.");
        require(block.timestamp > journeys[_journeyId].endDate, "Journey hasn't ended.");
        sendMoney(msg.sender, _amount);

        emit PaymentCollected(_journeyId, msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Journey provider should destroy tickets after collecting payment for the tickets
     *
     * Requirements:
     * - Journey ID is valid
     * - Only journey provider can destroy tickets
     * - At least one ticket was sold for the journey
     * - Journey should've completed
    */
    function destroyTickets(uint _journeyId, uint[] memory _ticketIds) public {
        require(_journeyId < journeys.length, "Journey doesn't exist.");
        require(msg.sender == journeys[_journeyId].provider, "You are not the provider.");
        require(block.timestamp > journeys[_journeyId].endDate, "Journey hasn't ended.");
        uint quantity = _ticketIds.length;
        require(quantity > 0, "No tickets to destroy.");
        for(uint8 i = 0; i < quantity; i++) {
            if(ticketToJourney[_ticketIds[i]] == _journeyId) {
                _burn(_ticketIds[i]);
            }
        }
    }
    
    /**
     * @dev Helper function for other contract methods that require sending money
    */
    function sendMoney(address to, uint _amount) internal {
        require(address(0) != msg.sender, "Invalid address.");
        require(address(this).balance >= _amount, "Not enough balance on contract.");
        payable(to).transfer(_amount);

        emit MoneySent(to, _amount, block.timestamp);
    }

}