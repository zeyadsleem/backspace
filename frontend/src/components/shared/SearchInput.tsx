import { Search, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
	value: string;
	placeholder?: string;
	onChange?: (value: string) => void;
	onSubmit?: (value: string) => void;
	debounceMs?: number;
	className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
	({ value, placeholder = "Search...", onChange, onSubmit, debounceMs = 300, className }, ref) => {
		const [localValue, setLocalValue] = useState(value);

		useEffect(() => {
			setLocalValue(value);
		}, [value]);

		useEffect(() => {
			const timer = setTimeout(() => {
				if (localValue !== value) {
					onChange?.(localValue);
				}
			}, debounceMs);
			return () => clearTimeout(timer);
		}, [localValue, value, onChange, debounceMs]);

		const handleClear = useCallback(() => {
			setLocalValue("");
			onChange?.("");
		}, [onChange]);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLInputElement>) => {
				if (e.key === "Enter") {
					onSubmit?.(localValue);
				}
			},
			[localValue, onSubmit],
		);

		return (
			<div className={cn("relative", className)}>
				<Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
				<input
					className={cn(
						"h-11 w-full rounded-xl border bg-white ps-10 pe-10 text-sm transition-all",
						"placeholder:text-stone-400 dark:placeholder:text-stone-500",
						"focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
						"border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100",
					)}
					onChange={(e) => setLocalValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					ref={ref}
					type="text"
					value={localValue}
				/>
				{localValue && (
					<IconButton
						className="absolute end-1 top-1/2 -translate-y-1/2"
						icon={<X className="h-4 w-4" />}
						label="Clear"
						onClick={handleClear}
						variant="ghost"
					/>
				)}
			</div>
		);
	},
);

SearchInput.displayName = "SearchInput";
