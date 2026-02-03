import { clsx } from "clsx";

/**
 * RTL-aware utility functions for consistent styling
 */

export function rtlClass(isRTL: boolean, ltrClass: string, rtlClass: string) {
	return isRTL ? rtlClass : ltrClass;
}

export function rtlMargin(isRTL: boolean, side: "left" | "right", size: string) {
	const actualSide = isRTL ? (side === "left" ? "right" : "left") : side;
	return `m${actualSide[0]}-${size}`;
}

export function rtlPadding(isRTL: boolean, side: "left" | "right", size: string) {
	const actualSide = isRTL ? (side === "left" ? "right" : "left") : side;
	return `p${actualSide[0]}-${size}`;
}

export function rtlText(isRTL: boolean) {
	return isRTL ? "text-end" : "text-start";
}

export function rtlFlex(isRTL: boolean) {
	return isRTL ? "flex-row-reverse" : "flex-row";
}

export function rtlBorder(isRTL: boolean, side: "left" | "right") {
	const actualSide = isRTL ? (side === "left" ? "right" : "left") : side;
	return `border-${actualSide}`;
}

export function rtlPosition(isRTL: boolean, side: "left" | "right", size: string) {
	const actualSide = isRTL ? (side === "left" ? "right" : "left") : side;
	return `${actualSide}-${size}`;
}

// Logical properties (preferred approach)
export const rtlLogical = {
	marginStart: (size: string) => `ms-${size}`,
	marginEnd: (size: string) => `me-${size}`,
	paddingStart: (size: string) => `ps-${size}`,
	paddingEnd: (size: string) => `pe-${size}`,
	borderStart: "border-s",
	borderEnd: "border-e",
	start: (size: string) => `start-${size}`,
	end: (size: string) => `end-${size}`,
	textStart: "text-start",
	textEnd: "text-end",
};

export function cn(...classes: (string | undefined | null | false)[]): string {
	return clsx(classes.filter(Boolean));
}
