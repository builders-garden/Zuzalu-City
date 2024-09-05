import React from 'react';
import { Chip } from '@mui/material';

interface SortChipProps {
  icon: React.ReactElement;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const SortChip: React.FC<SortChipProps> = ({
  label,
  selected,
  onClick,
  icon,
}) => {
  return (
    <Chip
      label={label}
      variant="filled"
      size="small"
      color={selected ? 'primary' : 'secondary'}
      icon={icon}
      sx={{
        borderRadius: '10px',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'primary.dark',
        padding: '4px 8px',
      }}
      onClick={onClick}
    />
  );
};

export default SortChip;
