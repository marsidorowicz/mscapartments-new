/** @format */

import reducers from "./reducers"
import { configureStore } from "@reduxjs/toolkit"

// export const store = createStore(reducers, {})
export const store = configureStore({
	reducer: reducers,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
