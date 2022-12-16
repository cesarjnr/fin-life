import { Flex } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { AiFillFolder } from "react-icons/ai";

import { Logo } from '../Logo';

export const Sidebar = () => (
  <Flex
    justify="center"
    backgroundColor="black.800"
    display="flex"
    direction="column"
    gridGap={28}
    py={12}
>
    <Logo />
    <Box flex="1">
        <Box px={8} py={4}>
            <Icon as={AiFillFolder} w={6} h={6} />
        </Box>
    </Box>
  </Flex>
);
