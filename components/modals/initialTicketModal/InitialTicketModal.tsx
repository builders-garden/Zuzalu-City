import { Box, Stack, Typography } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import { ZuButton } from "@/components/core";
import { EthIcon } from "@/components/icons/EthIcon";
import { USDTIcon } from "@/components/icons/USDTIcon";
import { Dispatch, SetStateAction, useState } from "react";
import { CheckedCircleIcon } from "@/components/icons/CheckedCircleIcon";
import { EmptyCircleIcon } from "@/components/icons/EmptyCircleIcon";
import { RightArrowIcon } from "@/components/icons";

interface PropTypes {
    showModal: boolean;
    setShowModal: Dispatch<SetStateAction<boolean>>
}

export const InitialTicketModal = ({ showModal, setShowModal }: PropTypes) => {

    const [selectedToken, setSelectedToken] = useState('usdt')

    const tokens = ['usdt', 'usdc'];

    return (
        showModal ? <Stack
            sx={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                zIndex: 5,
                top: '0px',
                left: '0px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                backgroundColor: '#0003',
                paddingTop: '50px',
                boxSizing: 'border-box'
            }}
        >
            <Stack
                sx={{
                    width: '700px',
                    height: '100%',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: '#222'
                }}
            >
                <Stack
                    sx={{
                        width: '100%',
                        height: '54px',
                        padding: '10px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '14px',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.10)'
                    }}
                >
                    <Box
                        display={'flex'}
                        flexDirection={'row'}
                        gap={'10px'}
                        padding={'6px 10px'}
                        alignItems={'center'}
                        sx={{
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <CloseIcon sx={{ width: '20px', height: '20px' }} />
                        <Typography fontSize={'14px'} fontWeight={600} lineHeight={'160%'}>
                            Close
                        </Typography>
                    </Box>
                    <Typography
                        fontSize={'18px'}
                        fontWeight={700}
                        lineHeight={'120%'}
                    >
                        Create Ticket
                    </Typography>
                </Stack>
                <Stack
                    sx={{
                        width: '100%',
                        padding: '20px',
                        boxSizing: 'border-box',
                        gap: '30px'
                    }}
                >
                    <Box
                        width={'100%'}
                        padding={'20px'}
                        display={'flex'}
                        flexDirection={'column'}
                        gap={'30px'}
                        boxSizing={'border-box'}
                        borderRadius={'10px'}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        <Box
                            display={'flex'}
                            flexDirection={'column'}
                            gap={'20px'}
                        >
                            <Typography fontSize={'20px'} fontWeight={700} lineHeight={'120%'}>
                                Initial Setup
                            </Typography>
                            <Typography fontSize={'16px'} fontWeight={400} lineHeight={'160%'}>
                                Before you create tickets for this event, you’ll need to first set the receiving token and address for ticket purchases via crypto payments. These settings can be changed later.
                            </Typography>
                        </Box>
                        <Box
                            display={'flex'}
                            flexDirection={'column'}
                            gap={'20px'}
                        >
                            <Box
                                display={'flex'}
                                flexDirection={'column'}
                                gap={'10px'}
                            >
                                <Typography fontSize={'16px'} fontWeight={700} lineHeight={'120%'}>
                                    Select Receiving Token
                                </Typography>
                                <Typography fontSize={'13px'} fontWeight={400} lineHeight={'140%'} letterSpacing={'0.13px'}>
                                    Select the token(s) to be received as payment for ticket purchases
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                flexDirection={'column'}
                                gap={'10px'}
                            >
                                <Typography textTransform={'uppercase'} fontSize={'10px'} fontWeight={400} letterSpacing={'0.2px'} sx={{ opacity: 0.6 }}>Protocol:</Typography>
                                <ZuButton
                                    startIcon={<EthIcon />}
                                    sx={{
                                        padding: '5px 10px'
                                    }}
                                >
                                    Ethereum Chain
                                </ZuButton>
                            </Box>
                            <Box
                                display={'flex'}
                                flexDirection={'column'}
                                gap={'10px'}
                            >
                                <Typography textTransform={'uppercase'} fontSize={'10px'} fontWeight={400} letterSpacing={'0.2px'} sx={{ opacity: 0.6 }}>
                                    TOKEN:
                                </Typography>
                                <Box
                                    display={'flex'}
                                    flexDirection={'row'}
                                    width={'100%'}
                                    gap={'10px'}
                                >
                                    {
                                        tokens.map((token, index) => {
                                            return (
                                                <ZuButton
                                                    sx={{
                                                        padding: '10px 20px',
                                                        flex: '1',
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        backgroundColor: selectedToken === token ? 'rgba(125, 255, 209, 0.10)' : 'rgba(255, 255, 255, 0.05)',
                                                        border: selectedToken === token ? '1px solid rgba(125, 255, 209, 0.10)' : '1px solid rgba(255, 255, 255, 0.10)'
                                                    }}
                                                    key={index}
                                                    onClick={() => setSelectedToken(token)}
                                                >
                                                    <Box
                                                        display={'flex'}
                                                        flexDirection={'row'}
                                                        alignItems={'center'}
                                                        gap={'10px'}
                                                    >
                                                        <USDTIcon />
                                                        USDT
                                                    </Box>
                                                    {
                                                        selectedToken === token ? <CheckedCircleIcon /> : <EmptyCircleIcon />
                                                    }
                                                </ZuButton>
                                            )
                                        })
                                    }

                                </Box>
                            </Box>
                        </Box>
                        <Typography fontSize={'16px'} fontWeight={'400'} lineHeight={'160%'} sx={{ opacity: 0.6 }}>
                            description - let the user know that the proceeds of this ticket purchases are sent to the contract
                        </Typography>
                    </Box>
                    <ZuButton
                        sx={{
                            padding: '8px 14px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            backgroundColor: 'rgba(103, 219, 255, 0.10)',
                            border: '1px solid rgba(103, 219, 255, 0.20)'
                        }}
                    >
                        <RightArrowIcon color="#67DBFF" />
                        <Typography color={'#67DBFF'} fontSize={'14px'} fontWeight={600}>
                            Confirm
                        </Typography>
                    </ZuButton>
                </Stack>
            </Stack>
        </Stack>
        : <></>
    )
}