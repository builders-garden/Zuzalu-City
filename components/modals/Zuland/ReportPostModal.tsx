'use client';

import { useState } from 'react';
import { FlagIcon } from '@/components/icons/Flag';
import { Button } from '@mui/material';

import { Box, Chip, Typography } from '@mui/material';

import { Modal } from '@mui/material';

interface ReportPostModalProps {
  openReportModal: boolean;
  setOpenReportModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReportPostModal = ({
  openReportModal,
  setOpenReportModal,
}: ReportPostModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const reportReasons = [
    'Harassment',
    'Fraud or scam',
    'Spam',
    'Misinformation',
    'Hateful speech',
    'Threat or violence',
    'Self harm',
    'Graphic content',
    'Sexual content',
    'Fake account',
    'Bot account',
  ];
  const handleCloseReportModal = () => setOpenReportModal(false);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleReportUser = () => {
    if (selectedReason) {
      // Implement the report logic here
      console.log(`Reporting user for: ${selectedReason}`);
      handleCloseReportModal();
    }
  };

  return (
    <Modal
      open={openReportModal}
      onClose={handleCloseReportModal}
      aria-labelledby="report-modal-title"
    >
      <Box
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.default',
          border: '2px solid #222222',
          borderRadius: '10px',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id="report-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
        >
          Report this discussion
        </Typography>
        <Typography variant="body1" gutterBottom>
          Select a reason that applies
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {reportReasons.map((reason) => (
            <Chip
              key={reason}
              label={reason}
              onClick={() => handleReasonSelect(reason)}
              color={selectedReason === reason ? 'primary' : 'secondary'}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
          }}
        >
          <Button
            onClick={handleCloseReportModal}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<FlagIcon size={4} />}
            disabled={!selectedReason}
            onClick={handleReportUser}
          >
            Report user
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReportPostModal;
