package finance

import (
	"fmt"
)

// PiastersPerEGP is the conversion rate
const PiastersPerEGP = 100

// FormatEGP converts piasters (int64) to a human-readable EGP string (e.g., "12.50")
func FormatEGP(piasters int64) string {
	egp := float64(piasters) / float64(PiastersPerEGP)
	return fmt.Sprintf("%.2f", egp)
}

// ToPiasters converts a float64 (EGP) to piasters (int64)
func ToPiasters(egp float64) int64 {
	return int64(egp*float64(PiastersPerEGP) + 0.5) // +0.5 for rounding
}

// CalculateSessionCost calculates the cost based on duration in minutes and hourly rate in piasters
// It applies a daily cap if dailyCapPiasters > 0
func CalculateSessionCost(minutes int, hourlyRatePiasters int64, dailyCapPiasters int64) int64 {
	if minutes <= 0 {
		return 0
	}
	// (minutes / 60) * hourlyRate
	// To maintain precision in integer math: (minutes * hourlyRate) / 60
	cost := (int64(minutes) * hourlyRatePiasters) / 60

	// Apply daily cap if set
	if dailyCapPiasters > 0 && cost > dailyCapPiasters {
		return dailyCapPiasters
	}

	return cost
}

// CalculateTotal sums a list of piaster amounts
func CalculateTotal(amounts ...int64) int64 {
	var total int64
	for _, a := range amounts {
		total += a
	}
	return total
}
