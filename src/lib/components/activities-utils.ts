type ColumnSort = {
	id: string;
	desc: boolean;
};
export type SortingState = ColumnSort[];

export const columns = [
	{
		accessorKey: "name",
		header: "Name",
		enableSorting: false,
	},
	{
		accessorKey: "distance",
		header: "Distance",
		cell: ({ cell }) => `${(+cell.getValue() / 1000).toFixed(2)}km`,
	},
	{
		accessorKey: "kudos",
		header: "Kudos",
	},
	{
		accessorKey: "start",
		header: "Start",
		// cell: ({ cell }: CellProps) =>
		// 	dayjs(cell.getValue()).format("DD / MM / YYYY [at] HH:mm"),
	},
	{
		accessorKey: "elevation",
		header: "Elevation",
		cell: ({ cell }) => `${cell.getValue()}m`,
	},
	{
		accessorKey: "elapsedTime",
		header: "Elapsed",
		// cell: ({ cell }: CellProps) => formatTime(+cell.getValue()),
	},
	{
		accessorKey: "movingTime",
		header: "Moving",
		// cell: ({ cell }: CellProps) => formatTime(+cell.getValue()),
	},
	{
		accessorKey: "type",
		header: "Type",
	},
];

// export const singleRowColumns = [
// 	...columns,
// 	{
// 		accessorKey: "id",
// 		header: "View on Strava",
// 		enableSorting: false,
// 		cell: ({ cell }: CellProps) => {
// 			return (
// 				<Link
// 					href={`https://strava.com/activities/${cell.getValue()}`}
// 					target="_blank"
// 				>
// 					View Activity on Strava
// 				</Link>
// 			);
// 		},
// 	},
// ];
