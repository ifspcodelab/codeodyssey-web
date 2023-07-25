import "@testing-library/jest-dom";
import { render, fireEvent } from "@testing-library/react";
import {describe, test, vitest, vi} from "vitest";
import Registration from "./index";
import {BrowserRouter} from "react-router-dom";
import {schema} from "../Registration/index.tsx"
import {useTranslation} from "react-i18next";

vi.mock('react-i18next')

const tSpy = vi.fn((str: string) => str)
const useTranslationSpy = useTranslation as vi.Mock

beforeEach(() => {
    vi.clearAllMocks()

    useTranslationSpy.mockReturnValue({
        t: tSpy,
        i18n: {
            language: 'en',
        },
    })
})

describe("Registration", () => {

   test("Should be able to see the Page Header title on the screen", () => {
       const { getByText } = render(
           <BrowserRouter>
               <Registration/>
           </BrowserRouter>
       );

       expect(getByText("registration.title")).toBeInTheDocument();
   })

    test("Should be able to see all the form fields", () => {
        const { getByLabelText, getByText } = render(
            <BrowserRouter>
                <Registration/>
            </BrowserRouter>
        );

        expect(getByText("registration.form.name")).toBeInTheDocument();
        expect(getByText("registration.form.email")).toBeInTheDocument();
        expect(getByText("registration.form.password")).toBeInTheDocument();
        expect(getByLabelText('registration.form.termsCheckbox')).toBeInTheDocument();
    })

    test("Should verify that translation is being called", () => {
        render(
            <BrowserRouter>
                <Registration/>
            </BrowserRouter>
        );

        expect(tSpy).toHaveBeenCalled()
    })

    test("Should be able to see the login button text", () => {
        const { getByTestId } = render(
            <BrowserRouter>
                <Registration/>
            </BrowserRouter>
        );

        expect(getByTestId("loginButton")).toBeInTheDocument();
    })

    test("Should be able to see the submit button text", () => {
        const { getByTestId } = render(
            <BrowserRouter>
                <Registration/>
            </BrowserRouter>
        );

        expect(getByTestId("submitButton")).toBeInTheDocument();
    })

    test("requires user's name", async () => {
        await expect(schema.validateAt('name', {})).rejects.toMatch(/name is a required field/)
        await expect(schema.validateAt('name', {name: "inv"})).rejects.toMatch(/name must be at least 5 characters/)
        await expect(schema.validateAt('name', {name: "valid name"})).resolves.toBeTruthy()
    })

    test("Should email be validated", async () => {
        await expect(schema.validateAt('email', {})).rejects.toMatch(/email is a required field/)
        await expect(schema.validateAt('email', {email: "email"})).rejects.toMatch(/email must be a valid email/)
        await expect(schema.validateAt('email', {email: "email@emailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemaile.com"})).rejects.toMatch(/email must be a valid email/)
        await expect(schema.validateAt('email', {email: 'ema`i´l\'"@email'})).rejects.toMatch(/email must be a valid email/)
        await expect(schema.validateAt('email', {email: "email@email"})).resolves.toBeTruthy()
    })

    test("Should password be validated", async () => {
        await expect(schema.validateAt('password', {})).rejects.toMatch(/password is a required field/)
        await expect(schema.validateAt('password', {password: "1A$a"})).rejects.toMatch(/password must be at least 8 characters/)
        await expect(schema.validateAt('password', {password: "invalidpassword"})).rejects.toMatch(/Password must have at least one digit/)
        await expect(schema.validateAt('password', {password: "invalidpassword1"})).rejects.toMatch(/Password must have at least one uppercase letter/)
        await expect(schema.validateAt('password', {password: "invalidpassword1A"})).rejects.toMatch(/Password must have at least one special character/)
        await expect(schema.validateAt('password', {password: "invalidpassword1Ainvalidpassword1Ainvalidpassword1Ainvalidpasswor"})).rejects.toMatch(/password must be at most 64 characters/)
        await expect(schema.validateAt('password', {password: "ValidPassword@1"})).resolves.toBeTruthy()
    })

    test("Should terms be validated", async () => {
        await expect(schema.validateAt('terms', {terms: false})).rejects.toMatch(/You must agree with the terms and privacy policy/)
        await expect(schema.validateAt('terms', {terms: true})).resolves.toBeTruthy()
    })

    test("Should be able to send registration request", () => {
        const { getByTestId } = render(
            <BrowserRouter>
                <Registration/>
            </BrowserRouter>
        );

        fireEvent.click(getByTestId("submitButton"));
    })

    test("Should send request with data after form submission", async () => {
        const { getByLabelText, getByTestId } = render(
            <BrowserRouter>
                <Registration />
            </BrowserRouter>
        );

        const inputName = getByLabelText('registration.form.name');
        const inputEmail = getByLabelText('registration.form.email');
        const inputPassword = getByLabelText('registration.form.password');
        const inputTerms = getByLabelText('registration.form.termsCheckbox')
        const submitButton =getByTestId('submitButton');

        fireEvent.change(inputName, { target: { value: 'John Doe' } });
        fireEvent.change(inputEmail, { target: { value: 'johndoe@email.com' } });
        fireEvent.change(inputPassword, { target: { value: 'Password@01' } });
        fireEvent.change(inputTerms, { target: {value: true}})

        fireEvent.click(submitButton);

        const result = await vitest.fn();

        expect(result).toMatchSnapshot();
    })

    test("Should send to login page after clicking the login button", async () => {
        const { getByTestId } = render(
            <BrowserRouter>
                <Registration />
            </BrowserRouter>
        );

        const loginButton = getByTestId("loginButton")

        fireEvent.click(loginButton)

        const result = await vitest.fn();

        expect(result).toMatchSnapshot("Login Page");
    })
});