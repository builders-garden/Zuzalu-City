'use client';

import { useState, Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { ZuButton, ZuInput, ZuSwitch } from '@/components/core';
import { createApp, createAppRelease, getAppByEventId } from '@/utils/akasha';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { useAkashaAuthStore } from '@/hooks/zuland-akasha-store';
import { isAddress } from 'viem';

interface CreateDiscussionModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  showToast: (
    text: string,
    severity: 'success' | 'error' | 'info' | 'warning',
  ) => void;
  eventId: string;
  eventName: string;
  eventDescription: string;
}

export default function CreateDiscussionModal({
  showModal,
  setShowModal,
  showToast,
  eventId,
  eventName,
  eventDescription,
}: CreateDiscussionModalProps) {
  const { currentAkashaUser, loginAkasha } = useAkashaAuthStore();

  const [appAlreadyExists, setAppAlreadyExists] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(eventName);
  const [description, setDescription] = useState<string>(eventDescription);

  // nft gated
  const [nftGated, setNftGated] = useState<boolean>(false);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [chainName, setChainName] = useState<string>('Ethereum');
  const [functionName, setFunctionName] = useState<string>('balanceOf');
  // const [functionParams, setFunctionParams] = useState<string>(':userAddress');

  const [comparator, setComparator] = useState<string>('>');
  const [comparisonValue, setComparisonValue] = useState<string>('0');

  const litSupportedChains = useMemo(() => {
    return Object.entries(LIT_CHAINS)
      .filter(([key]) => key !== 'hushedNorthstar')
      .sort(([keyA], [keyB]) =>
        keyA.toLowerCase().localeCompare(keyB.toLowerCase()),
      )
      .map(([key, chain]) => ({
        litIdentifier: key,
        chainName: chain.name,
        symbol: chain.symbol,
        chainId: chain.chainId,
      }));
  }, []);

  const availableComparators = [
    { id: 1, value: '>', label: 'Greater Than' },
    { id: 2, value: '<', label: 'Less Than' },
    { id: 3, value: '>=', label: 'Greater Than or Equal to' },
    { id: 4, value: '<=', label: 'Less Than or Equal to' },
    { id: 5, value: '=', label: 'Equal To' },
    { id: 6, value: '!=', label: 'Not Equal To' },
    { id: 7, value: 'contains', label: 'Contains' },
    { id: 7, value: '!contains', label: 'Not Contains' },
  ];

  useEffect(() => {
    async function checkAppExists() {
      const appAlreadyExists = await getAppByEventId(eventId);
      if (appAlreadyExists) {
        setAppAlreadyExists(true);
        setDisplayName(appAlreadyExists.name);
        setDescription(appAlreadyExists.description);
      }
    }
    checkAppExists();
  }, [eventId, eventName, setShowModal, showToast]);

  /* AKASHA login if not logged in */
  useEffect(() => {
    if (!currentAkashaUser) {
      loginAkasha();
    }
  }, [currentAkashaUser, loginAkasha]);

  const handleCreateDiscussion = async () => {
    if (!contractAddress || !isAddress(contractAddress)) {
      showToast('Please enter a valid contract address', 'error');
      return;
    } else if (!chainName) {
      showToast('Please select a chain', 'error');
      return;
    } else if (!displayName) {
      showToast('Please enter a display name', 'error');
      return;
    }

    try {
      const appAlreadyExists = await getAppByEventId(eventId);
      if (appAlreadyExists) {
        console.log('app already exists');
        return;
      }
      /* Create Akasha app */
      if (currentAkashaUser) {
        const createAppResult = await createApp({
          eventID: eventId,
          displayName: displayName,
          description: description,
        });
        if (createAppResult) {
          const createAppReleaseResult = await createAppRelease({
            applicationID: createAppResult?.document.id,
            source: `https://zuzalu.city/events/${eventId}`,
            version: '1.0.0',
          });
          console.log('createAppReleaseResult', createAppReleaseResult);
          showToast(
            `Successfully created Akasha discussion for "${eventName}"`,
            'success',
          );
          setShowModal(false);
        }
      } else {
        showToast(
          `Please connect to Akasha to create a discussion for "${eventName}"`,
          'error',
        );
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      showToast(`Error creating discussion for event "${eventName}"`, 'error');
    }
  };

  return (
    <Dialog
      open={showModal}
      onClose={() => setShowModal(false)}
      PaperProps={{
        style: {
          width: '692px',
          height: 'auto',
          padding: '20px 16px',
          backgroundColor: 'rgba(34, 34, 34, 0.9)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(40px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '20px',
          margin: '0px',
          maxWidth: 'unset',
        },
      }}
    >
      <DialogTitle
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          fontSize: '25px',
          fontWeight: 'bold',
        }}
      >
        {appAlreadyExists
          ? 'Discussion already exists'
          : 'Create a Discussion for this event'}
      </DialogTitle>
      <DialogContent style={{ width: '100%', color: 'white', padding: '10px' }}>
        <Stack
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
          spacing={2}
        >
          <Stack spacing={1}>
            <Typography fontSize={'18px'}>Display Name</Typography>
            <ZuInput
              value={displayName}
              onChange={(e) => {
                if (!appAlreadyExists) {
                  setDisplayName(e.target.value);
                }
              }}
              disabled={appAlreadyExists}
            />
          </Stack>
          <Stack spacing={1}>
            <Typography fontSize={'18px'}>Description</Typography>
            <ZuInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Stack>
          <Stack spacing={1}>
            <Typography fontSize={'18px'}>Event NFT Gated?</Typography>
            <ZuSwitch
              checked={nftGated}
              onChange={() => setNftGated((v) => !v)}
            />
          </Stack>
          {nftGated ? (
            <>
              <Stack spacing={0}>
                <Typography variant="body2">
                  We support NFT contracts following OpenZeppelin ERC721
                  standard.
                </Typography>
                <Typography variant="body2">
                  We check if balanceOf(userAddress) &#x3e; 0.
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography fontSize={'18px'}>Contract Address</Typography>
                <ZuInput
                  value={contractAddress}
                  placeholder="0x..."
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography fontSize={'18px'}>Contract Chain</Typography>
                <Select
                  value={chainName}
                  placeholder="Select Lit Compatible Chain"
                  onChange={(e) => setChainName(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#222222',
                      },
                    },
                  }}
                >
                  {litSupportedChains &&
                    litSupportedChains.map((chain) => (
                      <MenuItem
                        key={chain.litIdentifier}
                        value={chain.chainName}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#333333',
                          },
                        }}
                      >
                        {chain.chainName}
                      </MenuItem>
                    ))}
                </Select>
              </Stack>
              {/*
              <Accordion
                sx={{
                  backgroundColor: '#222222',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  style={{ marginTop: '10px' }}
                >
                  <Typography>Advanced Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Stack spacing={1}>
                      <Typography fontSize={'18px'}>Function Name</Typography>
                      <ZuInput
                        value={functionName}
                        placeholder="functionName"
                        onChange={(e) => setFunctionName(e.target.value)}
                      />
                    </Stack>
                     <Stack spacing={1}>
                      <Typography fontSize={'18px'}>Function Params</Typography>
                      <ZuInput
                        value={functionParams}
                        placeholder="functionParams"
                        onChange={(e) => setFunctionParams(e.target.value)}
                      />
                      <Typography variant="body2" color="gray.700">
                        <a
                          href="https://developer.litprotocol.com/sdk/access-control/evm/basic-examples"
                          style={{
                            textDecoration: 'underline',
                            color: 'white',
                          }}
                          target="_blank"
                        >
                          See more examples using Function Params.
                        </a>{' '}
                        If you need multiple params, separate them with a
                        semicolon (;)
                      </Typography>
                    </Stack> 
                    <Stack spacing={1}>
                      <Typography fontSize={'18px'}>Comparator</Typography>
                      <Select
                        value={comparator}
                        placeholder="Select Comparator"
                        onChange={(e) => setComparator(e.target.value)}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              backgroundColor: '#222222',
                            },
                          },
                        }}
                      >
                        {availableComparators &&
                          availableComparators.map((comparator) => (
                            <MenuItem
                              key={comparator.id}
                              value={comparator.value}
                              sx={{
                                '&:hover': {
                                  backgroundColor: '#333333',
                                },
                              }}
                            >
                              {comparator.label} ({comparator.value})
                            </MenuItem>
                          ))}
                      </Select>
                      <Typography variant="body2" color="gray.700">
                        <a
                          href="https://developer.litprotocol.com/sdk/access-control/evm/basic-examples"
                          style={{
                            textDecoration: 'underline',
                            color: 'white',
                          }}
                          target="_blank"
                        >
                          Learn more about Lit comparators.
                        </a>
                      </Typography>
                    </Stack>
                    {comparator !== 'contains' && comparator !== '!contains' ? (
                      <>
                        <Stack spacing={1}>
                          <Typography fontSize={'18px'}>
                            Comparison Value
                          </Typography>
                          <ZuInput
                            value={comparisonValue}
                            placeholder="comparisonValue"
                            onChange={(e) => setComparisonValue(e.target.value)}
                          />
                        </Stack>
                      </>
                    ) : null}
                  </Stack>
                </AccordionDetails>
              </Accordion>*/}
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions
        style={{
          justifyContent: 'center',
          width: '100%',
          padding: 0,
          flexDirection: 'column',
        }}
      >
        <ZuButton
          sx={{
            width: '100%',
            fontSize: '18px',
          }}
          onClick={handleCreateDiscussion}
          disabled={appAlreadyExists}
        >
          Create
        </ZuButton>
      </DialogActions>
    </Dialog>
  );
}
