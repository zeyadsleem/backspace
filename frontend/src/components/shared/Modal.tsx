import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: React.ReactNode;
	children: React.ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
	className?: string;
	showCloseButton?: boolean;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = "lg",
	className,
	showCloseButton = true,
}: ModalProps) {
	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
			<DialogContent
				className={cn("overflow-hidden", className)}
				maxWidth={maxWidth}
				showCloseButton={showCloseButton}
			>
				{title && (
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
				)}
				<DialogBody className="p-0">{children}</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
