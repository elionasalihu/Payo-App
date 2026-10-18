import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the landing page hero", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: /split expenses/i })).toBeInTheDocument();
});
