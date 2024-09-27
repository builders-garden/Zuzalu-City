import { ZuButton } from '@/components/core';
import {
  ArrowUpRightIcon,
  EventIcon,
  HomeIcon,
  MenuIcon,
  SpaceIcon,
} from '@/components/icons';
import { useCeramicContext } from '@/context/CeramicContext';
import {
  Box,
  Button,
  Drawer,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { EventData, Event } from '@/types';
import { useEffect, useState } from 'react';

interface PropTypes {
  open: boolean;
  onClose: () => void;
  selected: string;
}

export default function SidebarDrawer({ open, onClose, selected }: PropTypes) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, composeClient } = useCeramicContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getEvents = async () => {
    try {
      setIsLoading(true);
      const response: any = await composeClient.executeQuery(`
      query {
        zucityEventIndex(first: 100) {
          edges {
            node {
              id
              imageUrl
              title
              members{
              id
              }
              admins{
              id
              }
              superAdmin{
              id
              }
              profile {
                username
                avatar
              }
              space {
                name
                avatar
              }
              tracks
            }
          }
        }
      }
    `);

      if (response && response.data && 'zucityEventIndex' in response.data) {
        const eventData: EventData = response.data as EventData;
        return eventData.zucityEventIndex.edges.map((edge) => edge.node);
      } else {
        console.error('Invalid data structure:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let eventsData = await getEvents();
        if (eventsData) {
          setEvents(eventsData);
        }
      } catch (err) {
        console.log(err);
      }
    };
    isAuthenticated && fetchData();
  }, [isAuthenticated]);

  const naviButtons = [
    {
      content: 'Home',
      icon: <HomeIcon />,
      function: () => {
        router.push('/');
        onClose();
      },
    },
    {
      content: 'Spaces',
      icon: <SpaceIcon />,
      function: () => {
        router.push('/spaces');
        onClose();
      },
    },
    {
      content: 'Events',
      icon: <EventIcon />,
      function: () => {
        router.push('/events');
        onClose();
      },
    },
    // {
    //     content: 'Zapps',
    //     icon: <BoltIcon />,
    //     function: () => {
    //         onClose();
    //     }
    // }
  ];

  const footerItems = [
    {
      content: 'Blog',
      url: 'https://zuzalu.craft.me/ZuBuilderBlog',
    },
    // {
    //   content: 'Privacy',
    //   url: 'https://blog.zuzalu.city',
    // },
    // {
    //   content: 'Terms',
    //   url: 'https://blog.zuzalu.city',
    // },
  ];

  return (
    <Drawer open={open} onClose={onClose}>
      <Box
        sx={{
          width: '260px',
          height: '100vh',
          position: 'sticky',
          top: '50px',
          transitionProperty: 'width',
          transitionDuration: '300',
          transitionTimingFunction: 'ease-in-out',
          backgroundColor: '#2d2d2d',
          padding: '10px',
          borderRight: '1px solid rgb(58, 60, 62)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box
            display="flex"
            alignItems="center"
            gap="10px"
            sx={{ cursor: 'pointer' }}
          >
            <Button
              sx={{
                padding: '10px',
                width: '40px',
                minWidth: 'unset',
              }}
            >
              <MenuIcon />
            </Button>

            <Box
              component="img"
              src={isMobile ? '/ZuCityLogo-IconOnly.svg' : '/ZuCityLogo.svg'}
              height="40px"
            />
          </Box>
          <Box display="flex" flexDirection="column" paddingY="20px" gap="15px">
            {naviButtons.map((item, index) => {
              return (
                <Box
                  display="flex"
                  padding="10px"
                  alignItems="center"
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#383838' } }}
                  bgcolor={
                    pathname.split('/')[1] === item.content.toLowerCase()
                      ? '#383838'
                      : 'transparent'
                  }
                  gap="10px"
                  borderRadius="10px"
                  onClick={item.function}
                  key={index}
                >
                  {item.icon}
                  <Typography color="white" variant="bodyMB">
                    {item.content}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          gap="10px"
          sx={{
            borderTop: '1px solid #383838',
            borderBottom: '1px solid #383838',
            marginX: '10px',
            padding: '20px 0 10px',
            flex: 1,
            flexDirection: isAuthenticated ? 'column' : 'column-reverse',
          }}
        >
          {isAuthenticated ? (
            <>
              <Typography fontSize={10} color="rgba(255, 255, 255, 0.7)">
                YOUR RSVP&apos;D EVENTS
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                gap="10px"
                sx={{
                  overflowY: 'auto',
                  maxHeight: 'calc(100vh - 492px)',
                  flex: 1,
                }}
              >
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        gap="10px"
                        sx={{
                          padding: '6px 10px',
                          opacity: 0.7,
                          cursor: 'pointer',
                        }}
                      >
                        <Skeleton variant="rounded" width={20} height={20} />
                        <Skeleton variant="rounded" width={190} height={17} />
                      </Box>
                    ))
                  : events.map((event, index) => {
                      return (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          gap="10px"
                          sx={{
                            padding: '6px 10px',
                            opacity: 0.7,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            router.push(`/events/${event.id}`);
                          }}
                        >
                          <Image
                            src={event.imageUrl!}
                            alt={event.title}
                            width={20}
                            height={20}
                            style={{ objectFit: 'cover', borderRadius: '2px' }}
                          />
                          <Typography color="white" variant="bodyM" noWrap>
                            {event.title}
                          </Typography>
                        </Box>
                      );
                    })}
              </Box>
            </>
          ) : null}
          <Box
            display="flex"
            gap="10px"
            alignItems="center"
            justifyContent="center"
            sx={{ cursor: 'pointer' }}
            onClick={() =>
              window.open(
                'https://github.com/EthereumCommunityFund/Zuzalu-City',
                '_blank',
              )
            }
          >
            <Typography fontSize={10} color="rgba(255, 255, 255, 0.7)">
              Zuzalu city is open source
            </Typography>
            <Image
              src="/sidebar/gitHub.png"
              alt="github"
              width={24}
              height={24}
              style={{ opacity: 0.7 }}
            />
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            marginX: '10px',
            padding: '20px 0',
          }}
        >
          <Box
            gap="10px"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: '10px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
              }}
            >
              {footerItems.map((item, index) => {
                return (
                  <Typography
                    key={index}
                    color="rgba(225, 225, 225, 0.7)"
                    variant="body2"
                    component="a"
                    href={item.url}
                    target="_blank"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        textDecorationColor: '#7dffd1',
                        color: '#7dffd1',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {item.content}
                  </Typography>
                );
              })}
            </Box>
            <Typography
              color="rgba(225, 225, 225, 0.7)"
              variant="body2"
              component="a"
              href="https://s.craft.me/XUjXr6M4jT8VBZ"
              target="_blank"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  textDecorationColor: '#7dffd1',
                  color: '#7dffd1',
                  opacity: 0.7,
                },
              }}
            >
              About Zuzalu City
            </Typography>
          </Box>
          <ZuButton
            variant="outlined"
            endIcon={<ArrowUpRightIcon size={5} />}
            sx={{
              width: '100%',
              height: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              color: '#fff',
              fontWeight: 700,
              marginTop: '30px',
            }}
            onClick={() =>
              window.open(
                'https://zuzapp-v1-events-app-delta.vercel.app/dashboard/home',
                '_blank',
              )
            }
          >
            Legacy Registry App
          </ZuButton>
        </Box>
      </Box>
    </Drawer>
  );
}
