import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/token.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";

const publicUserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      occupation: true,
      householdSize: true,
      numberOfDependents: true,
      dietaryPreference: true,
      housingPreference: true,
      transportationPreference: true,
      lifestylePreference: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;

const authenticatedUserSelect = {
  ...publicUserSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

type AuthenticatedUserRecord = Prisma.UserGetPayload<{
  select: typeof authenticatedUserSelect;
}>;

function toPublicUser(user: AuthenticatedUserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile,
  };
}

function invalidCredentialsError() {
  return new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
}

function issueAccessToken(user: { id: string; email: string }) {
  return signAccessToken({
    sub: user.id,
    email: user.email,
  });
}

export const authService = {
  async register(input: RegisterInput) {
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      select: publicUserSelect,
    });

    return {
      user,
      accessToken: issueAccessToken(user),
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
      select: authenticatedUserSelect,
    });

    if (!user?.passwordHash) {
      throw invalidCredentialsError();
    }

    const passwordMatches = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw invalidCredentialsError();
    }

    return {
      user: toPublicUser(user),
      accessToken: issueAccessToken(user),
    };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authenticated user no longer exists",
      );
    }

    return user;
  },
};
