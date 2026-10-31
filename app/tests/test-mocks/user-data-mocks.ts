export interface MockUploadRequest {
  file?: {
    fieldname: string
    filename: string
    originalname: string
    mimetype: string
    size: number
    path: string
  }
  body: {
    username?: string
    email?: string
    simulateInvalidFile?: boolean
    simulateValidFile?: boolean
    simulateLargeFile?: boolean
  }
}

export interface TestApiResponse {
  success: boolean
  message?: string
  ticket?: unknown
  tickets?: unknown[]
  errors?: Record<string, unknown> | Record<string, string[]>
}

export interface MockFileValidationInput {
  mimetype?: string
  size?: number | undefined
}

export const invalidUserMock = {
  email: "alexmoldovan2009gmail.com",
  username: "moldovanalex"
}

export const mockUpdatedProfileResponse = {
  id: 1,
  name: "moldovanalex",
  email: "sandumoldovan2008@yahoo.com",
  avatar_url: "path/to/fake/avatar.webp",
  is_verified: true
}

export const validProfileUpdateMock = {
  username: "moldovanalex",
  email: "sandumoldovan2008@yahoo.com",
  simulateValidFile: true
}

export const invalidProfileUpdateMock = {
  username: "moldovanalex",
  email: "sandumoldovan2008@yahoo.com",
  simulateLargeFile: true
}

export const mockTickets = [
  { id: 1, title: "Issue 1", status: "OPEN" },
  { id: 2, title: "Issue 2", status: "IN_PROGRESS" }
]

export const fakeCreatedTicket = {
  id: 10,
  user_id: 1,
  subject: "Bug in profile page",
  status: "OPEN",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const fakeClosedTicket = {
  id: 5,
  subject: "Need help with login",
  status: "RESOLVED",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockedCountries = [
  {
    code: "ES",
    name: "Spain",
    capital: "Madrid",
    region: "Europe"
  },
  {
    code: "FR",
    name: "France",
    capital: "Paris",
    region: "Europe"
  },
  {
    code: "AN",
    name: "Andorra",
    capital: "Andorra la Vella",
    region: "Europe"
  }
]

export const existingUser = {
  id: 1,
  name: "Alex",
  email: "alex@example.com",
  avatar: "",
  isVerified: true
}

export const invalidPasswordCases = [
  {
    password: "abc1",
    message: /at least 6 characters/i,
    rule: "min length"
  },
  {
    password: "abcdef",
    message: /at least one letter and one number/i,
    rule: "letters only"
  },
  {
    password: "123456",
    message: /at least one letter and one number/i,
    rule: "digits only"
  }
]

export const successResponse = {
  success: true,
  message: "Profile updated successfully!",
  user: { id: 1, name: "Alex Updated", email: "new@example.com" }
}
