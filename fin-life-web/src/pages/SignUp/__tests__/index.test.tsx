import userEvent from '@testing-library/user-event';
import faker from 'faker';
import { render, screen, act } from '@testing-library/react';

import { SignUp } from '../index';
import { usePost } from '../../../hooks/usePost';

jest.mock('../../../hooks/usePost');

describe('SignUp', () => {
  const mockUsePost = usePost as jest.MockedFunction<typeof usePost>;
  const mockMakePostRequest = jest.fn();

  beforeEach(() => {
    mockUsePost.mockReturnValue({
      makePostRequest: mockMakePostRequest,
      isLoading: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should render the spinner component inside the button component when the post request is in progress', async () => {
    mockUsePost.mockReturnValue({
      makePostRequest: mockMakePostRequest,
      isLoading: true
    });

    render(<SignUp />);

    const spinner = screen.getByTestId('spinner');

    expect(spinner).toBeInTheDocument();
  });

  it('Should render a text inside the button component when there is no post request in progress', async () => {
    render(<SignUp />);

    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });

    expect(createAccountButton).toBeInTheDocument();
  });

  it('Should render 3 required input error messages', async () => {
    render(<SignUp />);

    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });

    await act(async () => {
      userEvent.click(createAccountButton);
    });

    const requiredFieldErrorMessages = screen.getAllByText('campo obrigatório');

    expect(requiredFieldErrorMessages).toHaveLength(3);
  });

  it('Should render the min password length error message', async () => {
    render(<SignUp />);

    const passwordInput = screen.getByPlaceholderText('Senha');
    const passwordInputValue = faker.internet.password(5);
    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });

    await act(async () => {
      userEvent.type(passwordInput, passwordInputValue);
      userEvent.click(createAccountButton);
    });

    const minInputLengthErrorMessage = screen.getByText('senha deve ser no mínimo 6 caracteres');

    expect(minInputLengthErrorMessage).toBeInTheDocument();
  });

  it('Should render the error messages of name and password max length', async () => {
    render(<SignUp />);

    const nameInput = screen.getByPlaceholderText('Nome');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });
    const nameInputValue = faker.random.alpha({ count: 51 });
    const passwordInputValue = faker.internet.password(17);

    await act(async () => {
      userEvent.type(nameInput, nameInputValue);
      userEvent.type(passwordInput, passwordInputValue);
      userEvent.click(createAccountButton);
    });

    const maxNameLengthErrorMessage = screen.getByText('nome deve ser no máximo 50 caracteres');
    const maxPasswordLengthErrorMessage = screen.getByText('senha dever ser no máximo 16 caracteres');

    expect(maxNameLengthErrorMessage).toBeInTheDocument();
    expect(maxPasswordLengthErrorMessage).toBeInTheDocument();
  });

  it('Should render the email input error message', async () => {
    render(<SignUp />);

    const emailInput = screen.getByPlaceholderText('Email');
    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });
    const emailInputValue = faker.random.alpha();

    await act(async () => {
      userEvent.type(emailInput, emailInputValue);
      userEvent.click(createAccountButton);
    });

    const invalidEmailErrorMessage = screen.getByText('email deve ser um email válido');

    expect(invalidEmailErrorMessage).toBeInTheDocument();
  });

  it('Should not call the onSubmit handler if the form is invalid', async () => {
    render(<SignUp />);

    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });

    await act(async () => {
      userEvent.click(createAccountButton);
    });

    expect(mockMakePostRequest).not.toHaveBeenCalled();
  });

  it("Should call the onSubmit handler if the form is valid", async () => {
    render(<SignUp />);

    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const createAccountButton = screen.getByRole('button', { name: 'Criar Conta' });
    const nameInputValue = faker.name.findName();
    const emailInputValue = faker.internet.email();
    const passwordInputValue = faker.internet.password();

    await act(async () => {
      userEvent.type(nameInput, nameInputValue);
      userEvent.type(emailInput, emailInputValue);
      userEvent.type(passwordInput, passwordInputValue);
      userEvent.click(createAccountButton);
    });

    expect(mockMakePostRequest).toHaveBeenCalledWith({
      name: nameInputValue,
      email: emailInputValue,
      password: passwordInputValue
    });
  });
});
