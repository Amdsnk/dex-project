// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DEXRouter is Ownable {
    address public immutable factory;
    
    constructor(address _factory) {
        factory = _factory;
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        require(deadline >= block.timestamp, "DEX: EXPIRED");
        address pair = DEXFactory(factory).getPair(tokenA, tokenB);
        if (pair == address(0)) {
            pair = DEXFactory(factory).createPair(tokenA, tokenB);
        }
        
        IERC20(tokenA).transferFrom(msg.sender, pair, amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountBDesired);
        liquidity = DEXPair(pair).mint(to);
    }
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "DEX: EXPIRED");
        require(path.length >= 2, "DEX: INVALID_PATH");
        
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        
        for (uint i; i < path.length - 1; i++) {
            address pair = DEXFactory(factory).getPair(path[i], path[i + 1]);
            require(pair != address(0), "DEX: PAIR_NOT_FOUND");
            
            // Calculate amount out
            (uint reserveIn, uint reserveOut,) = DEXPair(pair).getReserves();
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
            
            // Perform swap
            IERC20(path[i]).transferFrom(
                i == 0 ? msg.sender : pair,
                pair,
                amounts[i]
            );
            DEXPair(pair).swap(0, amounts[i + 1], i < path.length - 2 ? pair : to);
        }
        
        require(amounts[amounts.length - 1] >= amountOutMin, "DEX: INSUFFICIENT_OUTPUT_AMOUNT");
    }
    
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        require(amountIn > 0, "DEX: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "DEX: INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }
}