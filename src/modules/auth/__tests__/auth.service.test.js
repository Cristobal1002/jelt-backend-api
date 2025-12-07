const authService = require("../auth.service");
const authRepository = require("../auth.repository");
const { hashPassword, comparePassword } = require("../../../utils/crypto");

jest.mock("../auth.repository");

describe("AuthService", () => {
  test("register debe crear un usuario nuevo", async () => {
    authRepository.findByEmail.mockResolvedValue(null);
    authRepository.createUser.mockResolvedValue({ id: 1, email: "test@mail.com" });

    const user = await authService.register({
      email: "test@mail.com",
      password: "123456",
      name: "User Test"
    });

    expect(user.email).toBe("test@mail.com");
  });

  test("login debe fallar si el usuario no existe", async () => {
    authRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login("none@mail.com", "pass")
    ).rejects.toThrow("Credenciales inválidas");
  });
});
