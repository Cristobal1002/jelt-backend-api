const controller = require("../auth.controller");
const authService = require("../auth.service");

jest.mock("../auth.service");

describe("AuthController", () => {
  test("register debe retornar 201 al registrar", async () => {
    const req = { body: {}, headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    authService.register.mockResolvedValue({ id: 1 });

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
