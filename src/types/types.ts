export type TravelEntry = {
    id: string;
    imageUri: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: number;
    title?: string;
    notes?: string;
    date?: number;
  };
  
  export type RootStackParamList = {
    Home: undefined;
    AddEntry: undefined;
    EntryDetail: { entry: TravelEntry };
  };