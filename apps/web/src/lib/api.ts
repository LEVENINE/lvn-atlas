export type City = {
  id: string;
  name: string;
  state: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type CitySummary = Pick<City, "id" | "name" | "state" | "country">;

export type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  occupation: string | null;
  householdSize: number | null;
  numberOfDependents: number | null;
  dietaryPreference: string | null;
  housingPreference: string | null;
  transportationPreference: string | null;
  lifestylePreference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profile: Profile | null;
};

export type AtlasScore = {
  score: number;
  band: "Strong" | "Promising" | "Tight" | "At risk";
  factors: {
    savingsRate: number;
    expenseRatio: number;
    housingCostRatio: number | null;
    householdSize: number;
  };
};

export type Blueprint = {
  id: string;
  userId: string;
  originCityId: string;
  destinationCityId: string;
  sourceJourneyId: string | null;
  /** Two-decimal string as returned by the API, e.g. "250000.00". */
  expectedMonthlyIncome: string;
  plannedRelocationDate: string | null;
  relocatingHouseholdSize: number;
  createdAt: string;
  updatedAt: string;
  originCity: CitySummary;
  destinationCity: CitySummary;
  /** Derived readiness estimate; never sent by the client. */
  atlasScore: AtlasScore;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetExpenseItem = {
  id: string;
  budgetId: string;
  categoryId: string;
  /** Two-decimal string as returned by the API, e.g. "25000.00". */
  amount: string;
  createdAt: string;
  updatedAt: string;
  category: Pick<ExpenseCategory, "id" | "name">;
};

export type Budget = {
  id: string;
  blueprintId: string;
  createdAt: string;
  updatedAt: string;
  expenseItems: BudgetExpenseItem[];
  summary: {
    expectedMonthlyIncome: string;
    totalExpenses: string;
    expectedSavings: string;
    disposableIncome: string;
  };
  /** Recalculated from this budget, so a save response is already current. */
  atlasScore: AtlasScore;
};

export type ExpenseItemInput = {
  categoryId: string;
  amount: number;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  firstName: string;
  lastName: string;
};

export type CreateBlueprintInput = {
  originCityId: string;
  destinationCityId: string;
  expectedMonthlyIncome: number;
  plannedRelocationDate?: string;
  relocatingHouseholdSize?: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const TOKEN_STORAGE_KEY = "lvn-atlas.access-token";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ErrorPayload = {
  success?: false;
  error?: {
    code?: string;
    message?: string;
  };
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Could not reach the LVN Atlas API. Check your connection and try again.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as ErrorPayload | null)?.error;

    throw new ApiError(
      response.status,
      error?.code ?? "REQUEST_FAILED",
      error?.message ?? "Something went wrong. Please try again.",
    );
  }

  return payload as T;
}

export const api = {
  login: (input: LoginInput) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  register: (input: RegisterInput) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  me: () => request<User>("/auth/me"),

  cities: () => request<City[]>("/cities"),

  blueprints: () => request<Blueprint[]>("/blueprints"),

  blueprint: (id: string) => request<Blueprint>(`/blueprints/${id}`),

  createBlueprint: (input: CreateBlueprintInput) =>
    request<Blueprint>("/blueprints", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  deleteBlueprint: (id: string) =>
    request<void>(`/blueprints/${id}`, { method: "DELETE" }),

  expenseCategories: () => request<ExpenseCategory[]>("/expense-categories"),

  budget: (blueprintId: string) =>
    request<Budget>(`/blueprints/${blueprintId}/budget`),

  replaceBudget: (blueprintId: string, expenseItems: ExpenseItemInput[]) =>
    request<Budget>(`/blueprints/${blueprintId}/budget`, {
      method: "PUT",
      body: JSON.stringify({ expenseItems }),
    }),
};

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
