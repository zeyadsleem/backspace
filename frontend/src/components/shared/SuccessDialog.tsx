import { CheckCircle, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";

interface SuccessDialogProps {
	isOpen: boolean;
	title: string;
	description?: string;
	primaryActionText?: string;
	secondaryActionText?: string;
	onPrimaryAction?: () => void;
	onSecondaryAction?: () => void;
	onClose?: () => void;
}

export function SuccessDialog({
	isOpen,
	title,
	description,
	primaryActionText = "Continue",
	secondaryActionText,
	onPrimaryAction,
	onSecondaryAction,
	onClose,
}: SuccessDialogProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-stone-900">
				<IconButton
					className="absolute end-4 top-4"
					icon={<X className="h-5 w-5" />}
					label="Close"
					onClick={onClose}
					variant="ghost"
				/>
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
					<CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
				</div>
				<div className="text-center">
					<h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100">{title}</h3>
					{description && (
						<p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{description}</p>
					)}
				</div>
				<div className="mt-6 flex gap-3">
					{secondaryActionText && onSecondaryAction && (
						<Button className="flex-1" onClick={onSecondaryAction} size="md" variant="outline">
							{secondaryActionText}
						</Button>
					)}
					<Button className="flex-1" onClick={onPrimaryAction} size="md" variant="primary">
						{primaryActionText}
					</Button>
				</div>
			</div>
		</div>
	);
}
