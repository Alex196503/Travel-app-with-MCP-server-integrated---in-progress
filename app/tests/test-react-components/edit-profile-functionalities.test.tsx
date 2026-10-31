// @vitest-environment jsdom
import "@testing-library/jest-dom"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditProfilePage from "~/routes/edit-profile"
import { userEvent } from "@testing-library/user-event"
import {
  invalidPasswordCases,
  successResponse
} from "~/tests/test-mocks/user-data-mocks"
import { useFormToast } from "~/custom-hooks/utility-hooks"

vi.mock("~/custom-hooks/auth-hooks", async () => {
  const { existingUser } =
    await import("~/tests/test-mocks/user-data-mocks")
  return { useAuth: () => ({ user: existingUser }) }
})

vi.mock("~/custom-hooks/context-hooks", () => ({
  useThemeContext: () => ({ isDark: false, setDark: vi.fn() })
}))

vi.mock("~/custom-hooks/utility-hooks", () => ({
  useFormToast: vi.fn()
}))

const mockAction = vi.fn()

const renderPage = () => {
  const router = createMemoryRouter(
    [{ path: "/", Component: EditProfilePage, action: mockAction }],
    { initialEntries: ["/"] }
  )
  render(<RouterProvider router={router} />)
}

describe("edit profile client-side validation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAction.mockResolvedValue(null)
    URL.createObjectURL = vi.fn(() => "blob:mock-url")
    URL.revokeObjectURL = vi.fn()
  })
  it("shows and error and does not submit when the email is invalid", async () => {
    const user = userEvent.setup()
    renderPage()
    const emailInput = screen.getByPlaceholderText("name@example.com")
    const form = screen.getByTestId("formEdit")
    await user.clear(emailInput)
    await user.type(emailInput, "alexmoldovan2009")
    fireEvent.submit(form)
    expect(
      await screen.findByText(/invalid email format/i)
    ).toBeInTheDocument()
    expect(mockAction).not.toHaveBeenCalled()
  })

  it.each(invalidPasswordCases)(
    "shows error for $password($rule)",
    async ({ password, message }) => {
      const user = userEvent.setup()
      renderPage()
      const passwordField = screen.getByPlaceholderText("••••••••")
      const form = screen.getByTestId("formEdit")
      await user.type(passwordField, password)
      fireEvent.submit(form)
      expect(await screen.findByText(message)).toBeInTheDocument()
      expect(mockAction).not.toHaveBeenCalled()
    }
  )

  it("submits valid data and passes the success response on", async () => {
    mockAction.mockResolvedValueOnce(successResponse)
    const user = userEvent.setup()
    renderPage()
    const nameInput = screen.getByPlaceholderText(
      "e.g: alex_traveler"
    )
    const emailInput = screen.getByPlaceholderText("name@example.com")
    await user.clear(nameInput)
    await user.type(nameInput, successResponse.user.name)
    await user.clear(emailInput)
    await user.type(emailInput, successResponse.user.email)
    await user.click(
      screen.getByRole("button", { name: /save your changes/i })
    )
    await waitFor(() => expect(mockAction).toHaveBeenCalledTimes(1))
    expect(
      screen.queryByText(/invalid email format/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/at least 6 characters/i)
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(vi.mocked(useFormToast)).toHaveBeenCalledWith(
        expect.objectContaining({
          success: successResponse.success,
          message: successResponse.message
        }),
        expect.any(Function)
      )
    )
  })

  it("should successfully attach a file to the avatar input and hold its data", async () => {
    mockAction.mockResolvedValueOnce(successResponse)
    const user = userEvent.setup()
    renderPage()
    const inputUpload = screen.getByLabelText(
      /avatar/i
    ) as HTMLInputElement
    const file = new File([], "avatar.jpg", {
      type: "image/png"
    })
    expect(screen.getByText(/no file selected/i)).toBeInTheDocument()
    await user.upload(inputUpload, file)
    let filesUploaded = inputUpload.files
    expect(filesUploaded?.length).toEqual(1)
    expect(filesUploaded![0].name).toEqual("avatar.jpg")
    expect(screen.getByAltText("User preview")).toHaveAttribute(
      "src",
      "blob:mock-url"
    )
    await user.click(
      screen.getByRole("button", { name: /save your changes/i })
    )
    await waitFor(() => expect(mockAction).toHaveBeenCalledTimes(1))
  })

  it("should successfully reset the file field and unmount the preview image upon removal", async () => {
    const user = userEvent.setup()
    renderPage()
    const inputUpload = screen.getByLabelText(
      /avatar/i
    ) as HTMLInputElement
    const file = new File([], "avatarFile.png", {
      type: "image/png"
    })
    await user.upload(inputUpload, file)
    expect(screen.getByAltText("User preview")).toBeInTheDocument()
    const removalBtn = screen.getByTestId("btn-removal")
    await user.click(removalBtn)
    let filesUploaded = inputUpload.files
    expect(filesUploaded?.length).toBeFalsy()
    expect(screen.queryByAltText("User preview")).toBeNull()
  })

  it("ignores the files that do not match the accept filter", async () => {
    const user = userEvent.setup()
    renderPage()
    const input = screen.getByLabelText(/avatar/i) as HTMLInputElement
    const file = new File([], "notes.txt", {
      type: "text/plain"
    })
    await user.upload(input, file)
    expect(input.files).toHaveLength(0)
    expect(screen.getByText(/no file selected/i)).toBeInTheDocument()
  })

  it("shows an error and does not submit when the avatar exceeds 5MB", async () => {
    const user = userEvent.setup()
    renderPage()
    const bigFile = new File([], "hugeFile.png", {
      type: "image/png"
    })
    Object.defineProperty(bigFile, "size", { value: 6 * 1024 * 1024 })
    await user.upload(screen.getByLabelText(/avatar/i), bigFile)
    await user.click(
      screen.getByRole("button", { name: /save your changes/i })
    )
    expect(
      await screen.findByText(/max file size is 5mb/i)
    ).toBeInTheDocument()
    expect(mockAction).not.toHaveBeenCalled()
    expect(bigFile.size).toEqual(6 * 1024 * 1024)
  })
})
