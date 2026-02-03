import {
	forwardRef,
	type InputHTMLAttributes,
	type LabelHTMLAttributes,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";

// ============================================================================
// FormLabel
// ============================================================================
export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	required?: boolean;
	optional?: boolean;
	icon?: React.ReactNode;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
	({ className, required, optional, icon, children, ...props }, ref) => {
		const t = useAppStore((state) => state.t);

		return (
			<label
				className={cn(
					"flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300",
					className,
				)}
				ref={ref}
				{...props}
			>
				{icon}
				<span>{children}</span>
				{required && <span className="text-red-500">*</span>}
				{optional && <span className="text-stone-400">({t("optional")})</span>}
			</label>
		);
	},
);

FormLabel.displayName = "FormLabel";

// ============================================================================
// FormInput
// ============================================================================
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
	/** Force LTR for specific inputs like email/phone */
	forceLTR?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	({ className, error, forceLTR, type, ...props }, ref) => {
		const isRTL = useAppStore((state) => state.isRTL);
		const shouldForceLTR =
			forceLTR || type === "email" || type === "tel" || type === "url" || type === "number";

		return (
			<input
				className={cn(
					"h-11 w-full rounded-xl border px-3 font-medium text-sm transition-all",
					"focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
					"dark:bg-stone-800 dark:text-stone-100",
					"placeholder:text-stone-400 dark:placeholder:text-stone-500",
					error
						? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
						: "border-stone-200 dark:border-stone-700",
					className,
				)}
				dir={shouldForceLTR ? "ltr" : isRTL ? "rtl" : "ltr"}
				ref={ref}
				type={type}
				{...props}
			/>
		);
	},
);

FormInput.displayName = "FormInput";

// ============================================================================
// FormTextarea
// ============================================================================
export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
	({ className, error, ...props }, ref) => {
		const isRTL = useAppStore((state) => state.isRTL);

		return (
			<textarea
				className={cn(
					"w-full resize-none rounded-xl border px-3 py-2 font-medium text-sm transition-all",
					"focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
					"dark:bg-stone-800 dark:text-stone-100",
					"placeholder:text-stone-400 dark:placeholder:text-stone-500",
					error
						? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
						: "border-stone-200 dark:border-stone-700",
					className,
				)}
				dir={isRTL ? "rtl" : "ltr"}
				ref={ref}
				{...props}
			/>
		);
	},
);

FormTextarea.displayName = "FormTextarea";

// ============================================================================
// FormSelect
// ============================================================================
export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	error?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
	({ className, error, children, ...props }, ref) => {
		return (
			<select
				className={cn(
					"h-11 w-full rounded-xl border px-3 font-medium text-sm transition-all",
					"focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
					"bg-white dark:bg-stone-800 dark:text-stone-100",
					error
						? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
						: "border-stone-200 dark:border-stone-700",
					className,
				)}
				ref={ref}
				{...props}
			>
				{children}
			</select>
		);
	},
);

FormSelect.displayName = "FormSelect";

// ============================================================================
// FormError
// ============================================================================
export interface FormErrorProps {
	children?: React.ReactNode;
	className?: string;
}

export const FormError = ({ children, className }: FormErrorProps) => {
	if (!children) {
		return null;
	}

	return (
		<p className={cn("font-medium text-red-600 text-sm dark:text-red-400", className)}>
			{children}
		</p>
	);
};

FormError.displayName = "FormError";

// ============================================================================
// FormHelper
// ============================================================================
export interface FormHelperProps {
	children?: React.ReactNode;
	className?: string;
}

export const FormHelper = ({ children, className }: FormHelperProps) => {
	if (!children) {
		return null;
	}

	return <p className={cn("text-sm text-stone-500 dark:text-stone-400", className)}>{children}</p>;
};

FormHelper.displayName = "FormHelper";

// ============================================================================
// FormField (Container)
// ============================================================================
export interface FormFieldProps {
	children: React.ReactNode;
	className?: string;
}

export const FormField = ({ children, className }: FormFieldProps) => {
	return <div className={cn("space-y-1.5", className)}>{children}</div>;
};

FormField.displayName = "FormField";

// ============================================================================
// TextField (Composite: Label + Input + Error/Helper)
// ============================================================================
export interface TextFieldProps extends Omit<FormInputProps, "error"> {
	label: string;
	error?: string;
	helperText?: string;
	icon?: React.ReactNode;
	required?: boolean;
	optional?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	({ label, error, helperText, icon, required, optional, id, className, ...props }, ref) => {
		return (
			<FormField className={className}>
				<FormLabel htmlFor={id} icon={icon} optional={optional} required={required}>
					{label}
				</FormLabel>
				<FormInput error={!!error} id={id} ref={ref} {...props} />
				{error ? (
					<FormError>{error}</FormError>
				) : helperText ? (
					<FormHelper>{helperText}</FormHelper>
				) : null}
			</FormField>
		);
	},
);

TextField.displayName = "TextField";

// ============================================================================
// TextareaField (Composite: Label + Textarea + Error/Helper)
// ============================================================================
export interface TextareaFieldProps extends Omit<FormTextareaProps, "error"> {
	label: string;
	error?: string;
	helperText?: string;
	icon?: React.ReactNode;
	required?: boolean;
	optional?: boolean;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
	({ label, error, helperText, icon, required, optional, id, className, ...props }, ref) => {
		return (
			<FormField className={className}>
				<FormLabel htmlFor={id} icon={icon} optional={optional} required={required}>
					{label}
				</FormLabel>
				<FormTextarea error={!!error} id={id} ref={ref} {...props} />
				{error ? (
					<FormError>{error}</FormError>
				) : helperText ? (
					<FormHelper>{helperText}</FormHelper>
				) : null}
			</FormField>
		);
	},
);

TextareaField.displayName = "TextareaField";

// ============================================================================
// SelectField (Composite: Label + Select + Error/Helper)
// ============================================================================
export interface SelectFieldProps extends Omit<FormSelectProps, "error"> {
	label: string;
	error?: string;
	helperText?: string;
	icon?: React.ReactNode;
	required?: boolean;
	optional?: boolean;
	options?: Array<{ value: string; label: string }>;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
	(
		{
			label,
			error,
			helperText,
			icon,
			required,
			optional,
			options,
			id,
			className,
			children,
			...props
		},
		ref,
	) => {
		return (
			<FormField className={className}>
				<FormLabel htmlFor={id} icon={icon} optional={optional} required={required}>
					{label}
				</FormLabel>
				<FormSelect error={!!error} id={id} ref={ref} {...props}>
					{options
						? options.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))
						: children}
				</FormSelect>
				{error ? (
					<FormError>{error}</FormError>
				) : helperText ? (
					<FormHelper>{helperText}</FormHelper>
				) : null}
			</FormField>
		);
	},
);

SelectField.displayName = "SelectField";

// ============================================================================
// FormActions (Container for form buttons)
// ============================================================================
export interface FormActionsProps {
	children: React.ReactNode;
	className?: string;
	bordered?: boolean;
}

export const FormActions = ({ children, className, bordered = true }: FormActionsProps) => {
	return (
		<div
			className={cn(
				"flex gap-3 pt-4",
				bordered && "border-stone-100 border-t dark:border-stone-800",
				className,
			)}
		>
			{children}
		</div>
	);
};

FormActions.displayName = "FormActions";
