export interface TreeItem {
    "id": number;
    "latitude": string,
    "longitude": string;
    "datetimeadded": string;
    "dateplanted": string;
    "speciescomment": string;
    "comment": string;
    "googlestreeturl": string;
    "lastinsp_datetime": string;
    "lastinsp_comment": string;
    "lastinsp_crowndiameter": string;
    "lastinsp_trunkgirth": number;
    "lastinsp_height": number;
    "lastinsp_photo1": string;
    "lastinsp_photo2": string;
    "lastinsp_photo3": string;
    "lastinsp_remarks_list": string; //"\"3\"",
    "lastinsp_recommendations_list": string; //"\"3\"",
    "lastinsp_remarks_text": string;
    "lastinsp_recommendations_text": string;
    "is_deleted": boolean,
    "city": number;
    "useradded": number;
    "species": string;
    "placetype": number;
    "irrigationmethod": number;
    "lastinsp_status": string;
    "lastinsp_remarks": string;
    "lastinsp_recommendations": string;
    "species_id": number;
    "localname": string;	
}


export interface InspItem {
    "id"?: number;
    "tree": number;
    "user"?: number;
    "datetieme"?: string;
    "comment"?: string;
    "height"?: number;
    "crowndiameter"?: string;
    "trunkgirth"?: number;
    "status"?: number;
    "remarks"?: number[];
    "recommendations"?: number[];
    "photo1"?: string | null;
    "photo2"?: string | null;
    "photo3"?: string | null;
    "photoServer"?: string;
}


/*
export interface TreeItem {
	properties: {
		id: number;
		latitude: string;
		longitude: string;
		coordinates: string[];
		useradded: number;
		datetimeadded: string;
		species: number;
		dateplanted: string;
		comment: string;
        placetype: number;
        irrigationmethod: number;	
        remarks: string[];
        recommendations: string[];			
        lastinsp_status: number;
		lastinsp_crowndiameter: string;
        lastinsp_trunkgirth: number;
        lastinsp_height: number;
		type: string;
		geometry: {
			type: string;
			coordinates: string[];
		}		
	}
}*/





