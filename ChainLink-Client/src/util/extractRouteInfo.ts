import gpxParser from "gpxparser";

export interface RouteInfo {
    points: [number, number][];
    elevation: number[];
    distance: number;
    max_elevation: number;
    min_elevation: number;
    total_elevation_gain: number;
    startCoordinates: [number, number];
    endCoordinates: [number, number];
}

export const extractRouteInfo = async (file: File): Promise<RouteInfo> => {
    try {
        const reader = new FileReader();
        const gpxContent = await new Promise<string>((resolve) => {
            reader.onload = (e) => {
                if (e.target) {
                    resolve(e.target.result as string);
                } else {
                    resolve("");
                }
            };
            reader.readAsText(file);
        });

        if (!gpxContent) {
            throw new Error("GPX content is empty");
        }

        const parser = new gpxParser();
        parser.parse(gpxContent);

        if (parser.tracks.length == 0 || parser.tracks[0].points.length == 0) {
            throw new Error("Incorrect GPX File Type, use 'Tracks' version");
        }

        const routeInfo: RouteInfo = {
            points: parser.tracks[0].points.map((point: any) => [
                point.lat,
                point.lon,
            ]),
            elevation: parser.tracks[0].points.map((point: any) => point.ele),
            distance: parser.tracks[0].distance.total,
            max_elevation: parser.tracks[0].elevation.max,
            min_elevation: parser.tracks[0].elevation.min,
            total_elevation_gain:
                parser.tracks[0].elevation.max - parser.tracks[0].elevation.min,
            startCoordinates: [
                parser.tracks[0].points[0].lat,
                parser.tracks[0].points[0].lon,
            ],
            endCoordinates: [
                parser.tracks[0].points[parser.tracks[0].points.length - 1].lat,
                parser.tracks[0].points[parser.tracks[0].points.length - 1].lon,
            ],
        };

        return routeInfo;
    } catch (error) {
        console.error("Error extracting route information from GPX:", error);
        throw error;
    }
};