import { Flex } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons/lib';
import { AiFillFolder } from "react-icons/ai";
import { MdAccountBalanceWallet } from "react-icons/md";

import { Logo } from '../Logo';

interface MenuItem {
    label: string;
    iconComponent?: IconType;
    subItems?: {
        label: string;
    }[];
}

export const Sidebar = () => {
    const menuItems: MenuItem[] = [
        {
            iconComponent: AiFillFolder,
            label: 'Gerenciamento',
            subItems: [
                { label: 'Categorias de Despesas' },
                { label: 'Fluxo de Caixa' }
            ]
        },
        {
            iconComponent: MdAccountBalanceWallet,
            label: 'Portfólio'
        }
    ];

    return (
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
                {menuItems.map((menuItem) => (
                    <Box
                        key={menuItem.label}
                        cursor="pointer"
                        px={8}
                        py={4}
                        pos="relative"
                        role="group"
                        _hover={{
                            backgroundColor: "rgba(0, 210, 91, 0.05)",
                            _before: {
                                content: `""`,
                                backgroundColor: "green.500",
                                height: "100%",
                                left: 0,
                                position: "absolute",
                                top: 0,
                                width: "6px"
                            }
                        }}
                    >
                        <Icon
                            as={menuItem.iconComponent}
                            color="white"
                            h={6}
                            w={6}
                            _groupHover={{ color: 'green.500' }}
                        />
                    </Box>
                ))}
            </Box>
        </Flex>
    );
};
