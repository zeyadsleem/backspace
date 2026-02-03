import { Skeleton } from "../ui/skeleton";

export const DashboardSkeleton = () => {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-8 w-[200px]" />
				<div className="flex gap-2">
					<Skeleton className="h-10 w-[120px]" />
					<Skeleton className="h-10 w-[120px]" />
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton className="h-32 w-full" key={i} />
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Skeleton className="h-[350px] md:col-span-4" />
				<Skeleton className="h-[350px] md:col-span-3" />
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Skeleton className="h-[400px] md:col-span-3" />
				<Skeleton className="h-[400px] md:col-span-4" />
			</div>
		</div>
	);
};
