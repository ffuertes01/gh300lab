#!/usr/bin/env python3

# Lab 2 Practice File

def sum_squares_of_first_10_integers():
    """
    Calculate the sum of the squares of the first 10 positive integers (1 through 10).
    
    Returns:
        int: The sum of squares, which is 1^2 + 2^2 + ... + 10^2 = 385.
    """
    total = 0  # Initialize the sum to zero
    for i in range(1, 11):  # Loop from 1 to 10 inclusive
        total += i ** 2  # Add the square of i to the total
    return total  # Return the computed sum