export const getSeverityColor = (severity) => {
  const colors = {
    critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    high: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    low: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    information: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700',
  };
  return colors[severity] || colors.information;
};

export const getSeverityCheckboxClass = (severity) => {
  const classes = {
    critical: 'text-red-600 focus:ring-red-500',
    high: 'text-orange-600 focus:ring-orange-500',
    medium: 'text-yellow-600 focus:ring-yellow-500',
    low: 'text-blue-600 focus:ring-blue-500',
    information: 'text-gray-600 focus:ring-gray-500',
  };
  return classes[severity] || classes.information;
};
