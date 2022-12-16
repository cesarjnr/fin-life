import { Center, Box, Text, Flex, Spacer } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Spinner } from "@chakra-ui/spinner";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { CustomInput } from "../../components/CustomInput";
import { usePost } from "../../hooks/usePost";

interface UserForm {
  name: string;
  email: string;
  password: string;
}

const validationSchema = yup.object({
  name: yup
    .string()
    .required('campo obrigatório')
    .max(50, 'nome deve ser no máximo 50 caracteres'),
  email: yup
    .string()
    .required('campo obrigatório')
    .email('email deve ser um email válido'),
  password: yup
    .string()
    .required('campo obrigatório')
    .min(6, 'senha deve ser no mínimo 6 caracteres')
    .max(16, 'senha dever ser no máximo 16 caracteres')
});

export const SignUp = () => {
  const { handleSubmit, ...rest } = useForm<UserForm>({ resolver: yupResolver(validationSchema) });
  const { makePostRequest, isLoading } = usePost("/users");
  const componentHandleSubmit = (data: UserForm) => {
    makePostRequest<UserForm>(data);
  };

  return (
    <Center w="full" h="full">
      <Flex
        direction="column"
        w="500px"
        h="700px"
        bg="black.800"
        borderRadius="xl"
        py="39px"
        px="61px"
      >
        <Box>
          <Center>
            <Text
              as="span"
              color="green.500"
              fontSize="2xl"
              fontWeight="semibold"
              lineHeight="none"
            >
              Fin
            </Text>
            <Text as="span" color="white" fontSize="2xl" fontWeight="semibold">
              Life
            </Text>
          </Center>

          <Text
            align="center"
            color="white"
            fontSize="sm"
            fontWeight="semibold"
          >
            Sua vida financeira em um só lugar
          </Text>
        </Box>

        <Spacer />

        <FormProvider handleSubmit={handleSubmit} {...rest} >
          <Flex
            as="form"
            h="280px"
            direction="column"
            onSubmit={handleSubmit(componentHandleSubmit)}
          >
            <CustomInput
              name="name"
              placeholder="Nome"
              isPassword={false}
            />
            <Spacer />
            <CustomInput
              name="email"
              placeholder="Email"
              isPassword={false}
            />
            <Spacer />
            <CustomInput
              name="password"
              placeholder="Senha"
              isPassword={true}
            />
            <Spacer />
            <Button size="md" type="submit">
              {isLoading ? (
                <Spinner data-testid="spinner" />
              ) : (
                'Criar Conta'
              )}
            </Button>
          </Flex>
        </FormProvider>

        <Spacer />

        <Box>
          <Text
            align="center"
            color="white"
            fontSize="sm"
            fontWeight="semibold"
          >
            Já tem uma conta?
          </Text>
          <Text
            align="center"
            color="green.500"
            fontSize="sm"
            fontWeight="semibold"
          >
            Entrar
          </Text>
        </Box>
      </Flex>
    </Center>
  );
};
