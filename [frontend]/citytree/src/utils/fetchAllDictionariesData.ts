import { 
    URL_GET_DICT_SPECIESES, 
    URL_GET_DICT_CARETYPES,
    URL_GET_DICT_REMARKS,
    URL_GET_DICT_PLACETYPES,
    URL_GET_DICT_IRRIGATIONMETHODS,
    URL_GET_DICT_GROUPSPECS,
    URL_GET_DICT_TYPESPECS 
} from '../constants/urlsAPI';


export const fetchAllDictionariesData = async() => {		
    

    const [
        speciesesResponse, 
        caretypesResponse, 
        remarksResponse, 
        placetypesResponse, 
        irrigationmethodsResponse, 
        groupspecsResponse, 
        typespecsResponse
    ] = await Promise.all([
        
        fetchData(URL_GET_DICT_SPECIESES),
        fetchData(URL_GET_DICT_CARETYPES),
        fetchData(URL_GET_DICT_REMARKS),
        fetchData(URL_GET_DICT_PLACETYPES),
        fetchData(URL_GET_DICT_IRRIGATIONMETHODS),
        fetchData(URL_GET_DICT_GROUPSPECS),
        fetchData(URL_GET_DICT_TYPESPECS)
    ]);


    const specieses = await speciesesResponse;
    const caretypes = await caretypesResponse;
    const remarks = await remarksResponse;
    const placetypes = await placetypesResponse;
    const irrigationmethods = await irrigationmethodsResponse;
    const groupspecs = await groupspecsResponse;
    const typespecs = await typespecsResponse;

    return [
        specieses,
        caretypes,
        remarks,
        placetypes,
        irrigationmethods,
        groupspecs,
        typespecs    
    ];	
}

const fetchData = async (apiURL: string) => {			
    const res = await fetch(apiURL);
    const data = await res.json();
    return data; 			
} 