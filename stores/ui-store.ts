/**
 * UI Store
 * Using TanStack React Store for client-side UI state
 * Use this for UI state like modals, sidebars, themes, etc.
 * For server state (data fetching), use TanStack React Query instead
 */

import { Store } from "@tanstack/react-store";

/**
 * UI State Interface
 * Defines the shape of UI state
 */
interface UIState {
	sidebarOpen: boolean;
	theme: "light" | "dark" | "system";
	modalOpen: boolean;
	isLoading: boolean;
}

/**
 * Initial UI State
 */
const initialState: UIState = {
	sidebarOpen: false,
	theme: "system",
	modalOpen: false,
	isLoading: false,
};

/**
 * UI Store Instance
 * Create a single store instance for UI state
 */
export const uiStore = new Store<UIState>(initialState);

/**
 * Store Actions
 * Helper functions to update store state
 */

/**
 * Toggle sidebar open/closed
 */
export function toggleSidebar() {
	uiStore.setState((state) => ({
		...state,
		sidebarOpen: !state.sidebarOpen,
	}));
}

/**
 * Set sidebar state explicitly
 */
export function setSidebarOpen(open: boolean) {
	uiStore.setState((state) => ({
		...state,
		sidebarOpen: open,
	}));
}

/**
 * Set theme
 */
export function setTheme(theme: UIState["theme"]) {
	uiStore.setState((state) => ({
		...state,
		theme,
	}));

	// Apply theme to document
	if (typeof document !== "undefined") {
		const root = document.documentElement;
		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}
	}
}

/**
 * Toggle modal open/closed
 */
export function toggleModal() {
	uiStore.setState((state) => ({
		...state,
		modalOpen: !state.modalOpen,
	}));
}

/**
 * Set modal state explicitly
 */
export function setModalOpen(open: boolean) {
	uiStore.setState((state) => ({
		...state,
		modalOpen: open,
	}));
}

/**
 * Set loading state
 */
export function setLoading(isLoading: boolean) {
	uiStore.setState((state) => ({
		...state,
		isLoading,
	}));
}

/**
 * Reset UI state to initial values
 */
export function resetUIState() {
	uiStore.setState(initialState);
}
