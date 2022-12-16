import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { InputGroup, Input, InputRightElement } from "@chakra-ui/input";
import { FormControl, FormErrorMessage } from "@chakra-ui/form-control";
import { Icon } from "@chakra-ui/icon";
import { AiFillEye } from "react-icons/ai";
import { RiEyeCloseFill } from "react-icons/ri";

export interface CustomInputProps {
  name: string;
  placeholder: string;
  isPassword: boolean;
}

export const CustomInput = ({
  name,
  placeholder,
  isPassword
}: CustomInputProps) => {
  const [show, setShow] = useState<boolean>(false);
  const { register, formState: { errors } } = useFormContext();
  const getInputType = (): string =>
    !isPassword || show ? "text" : "password";
  const handleClick = (): void => {
    setShow(!show);
  };
  const errorMessage = errors[name]?.message;

  return (
    <FormControl isInvalid={Boolean(errorMessage)}>
      <InputGroup size="lg" color="whiteAlpha.400">
        <Input
          placeholder={placeholder}
          variant="filled"
          focusBorderColor={errorMessage ? "red.700" : "transparent"}
          errorBorderColor="red.700"
          fontSize="sm"
          type={getInputType()}
          {...register(name)}
        />
        {isPassword && (
          <InputRightElement>
            <Icon
              as={show ? RiEyeCloseFill : AiFillEye}
              cursor="pointer"
              onClick={handleClick}
              data-testid={show ? "closedEyeIcon" : "openEyeIcon"}
            />
          </InputRightElement>
        )}
      </InputGroup>
      {errorMessage && (
        <FormErrorMessage color="red.700">{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  );
};
