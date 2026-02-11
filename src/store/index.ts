import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import questionnaireReducer from "./slices/questionnaireSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import testimonialReducer from "./slices/testimonialSlice";
import cmsReducer from "./slices/cmsSlice";
import serviceReducer from "./slices/serviceSlice.ts";
import bookingsReducer from "./slices/bookingsSlice";
import sessionReducer from "./slices/sessionSlice";
import paymentReducer from "./slices/paymentSlice";
import adminReducer from "./slices/adminSlice";

// Redux Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    questionnaires: questionnaireReducer,
    subscriptions: subscriptionReducer,
    testimonials: testimonialReducer,
    cms: cmsReducer,
    services: serviceReducer,
    bookings: bookingsReducer,
    sessions: sessionReducer,
    payment: paymentReducer,
    admins: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
