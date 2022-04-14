export interface AccidentItem {
	properties: {
		id: number;
		latitude: string;
		longitude: string;
		datetime: string;
		description: string;
		drivers_injured: number;
		motorcyclists_injured: number;
        cyclists_injured: number;
        ped_injured: number;
        kids_injured: number;
        pubtr_passengers_injured: number;
        drivers_killed: number;
        motorcyclists_killed: number;
        cyclists_killed: number;
        ped_killed: number;
        kids_killed: number;
        pubtr_passengers_killed: number;
        public_transport_involved: boolean;
        maneuver: number;
        useradded: number;
		coordinates: string[];
		violations_type: string[];
        violators: string[];
		type: string;
		geometry: {
			type: string;
			coordinates: string[];
		}
	}
}

/*
interface AccidentGeometry {
	type: string;
	coordinates: string[];
}
interface AccidentPropertis {
	id: number;
	latitude: string;
	longitude: string;
	datetime: string;
	description: string;
	drivers_injured: number;
	motorcyclists_injured: number;
	cyclists_injured: number;
	ped_injured: number;
	kids_injured: number;
	pubtr_passengers_injured: number;
	drivers_killed: number;
	motorcyclists_killed: number;
	cyclists_killed: number;
	ped_killed: number;
	kids_killed: number;
	pubtr_passengers_killed: number;
	public_transport_involved: boolean;
	maneuver: number;
	useradded: number;
	coordinates: string[];
	violations_type: string[];
	violators: string[];
	type: string;
	geometry: AccidentGeometry;
}
export interface AccidentItem {
	properties: AccidentPropertis
}
*/

