// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EscrowWithTokens is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Milestone { 
        uint256 amount; 
        bool released; 
        bool funded; 
        address token; // Token address (address(0) for native AVAX)
    }
    
    struct Project { 
        address client; 
        address freelancer; 
        bool disputed; 
        Milestone[] milestones; 
    }

    mapping(uint256 => Project) public projects;
    uint256 public nextProjectId;

    event ProjectCreated(uint256 indexed projectId, address client, address freelancer);
    event MilestoneFunded(uint256 indexed projectId, uint256 indexed mid, uint256 amount, address token);
    event MilestoneReleased(uint256 indexed projectId, uint256 indexed mid, address to, uint256 amount, address token);
    event DisputeRaised(uint256 indexed projectId);

    // Fund milestone with native AVAX
    function fundMilestone(uint256 pid, uint256 mid) external payable {
        Project storage p = projects[pid];
        require(msg.sender == p.client, "only client can fund");
        require(!p.disputed, "project disputed");
        require(mid < p.milestones.length, "bad milestone");
        
        Milestone storage m = p.milestones[mid];
        require(!m.funded, "already funded");
        require(m.token == address(0), "use fundMilestoneWithToken for tokens");
        require(msg.value == m.amount, "send exact amount");
        
        m.funded = true;
        emit MilestoneFunded(pid, mid, msg.value, address(0));
    }

    // Fund milestone with ERC-20 tokens
    function fundMilestoneWithToken(uint256 pid, uint256 mid, address token) external {
        Project storage p = projects[pid];
        require(msg.sender == p.client, "only client can fund");
        require(!p.disputed, "project disputed");
        require(mid < p.milestones.length, "bad milestone");
        
        Milestone storage m = p.milestones[mid];
        require(!m.funded, "already funded");
        require(m.token == token, "wrong token");
        
        // Transfer tokens from client to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), m.amount);
        
        m.funded = true;
        emit MilestoneFunded(pid, mid, m.amount, token);
    }

    function approveMilestone(uint256 pid, uint256 mid) external nonReentrant {
        Project storage p = projects[pid];
        require(msg.sender == p.client, "only client");
        require(!p.disputed, "project disputed");
        
        Milestone storage m = p.milestones[mid];
        require(m.funded, "not funded");
        require(!m.released, "already released");
        
        m.released = true;
        
        if (m.token == address(0)) {
            // Release native AVAX
            payable(p.freelancer).transfer(m.amount);
            emit MilestoneReleased(pid, mid, p.freelancer, m.amount, address(0));
        } else {
            // Release ERC-20 tokens
            IERC20(m.token).safeTransfer(p.freelancer, m.amount);
            emit MilestoneReleased(pid, mid, p.freelancer, m.amount, m.token);
        }
    }

    function raiseDispute(uint256 pid) external {
        Project storage p = projects[pid];
        require(msg.sender == p.client || msg.sender == p.freelancer, "only parties");
        p.disputed = true;
        emit DisputeRaised(pid);
    }

    function refundMilestone(uint256 pid, uint256 mid) external nonReentrant {
        Project storage p = projects[pid];
        require(p.disputed, "not disputed");
        
        Milestone storage m = p.milestones[mid];
        require(m.funded && !m.released, "not refundable");
        
        m.released = true;
        
        if (m.token == address(0)) {
            // Refund native AVAX
            payable(p.client).transfer(m.amount);
        } else {
            // Refund ERC-20 tokens
            IERC20(m.token).safeTransfer(p.client, m.amount);
        }
    }

    function createProject(address freelancer, uint256[] calldata amounts, address[] calldata tokens) external returns (uint256) {
        require(amounts.length == tokens.length, "arrays must match");
        
        uint256 pid = nextProjectId++;
        Project storage p = projects[pid];
        p.client = msg.sender;
        p.freelancer = freelancer;
        p.disputed = false;
        
        for (uint i = 0; i < amounts.length; i++) {
            p.milestones.push(Milestone({
                amount: amounts[i], 
                released: false, 
                funded: false,
                token: tokens[i] // address(0) for native AVAX
            }));
        }
        
        emit ProjectCreated(pid, msg.sender, freelancer);
        return pid;
    }
}
