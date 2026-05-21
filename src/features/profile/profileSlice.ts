import { createSlice } from '@reduxjs/toolkit';

interface ProfileState {
  name: string;
  abhaId: string;
  age: number;
  location: string;
  phoneMasked: string;
}

const initialState: ProfileState = {
  name: 'Ananya Verma',
  abhaId: 'ananya@abdm',
  age: 34,
  location: 'New Delhi',
  phoneMasked: '******4207',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
});

export default profileSlice.reducer;
