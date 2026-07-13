import { Client } from '$app/common/interfaces/client';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { InfoCard } from '$app/components/InfoCard';
import { Spinner } from '$app/components/Spinner';
import { useMijnMotorSubscriptionQuery, Period } from '$app/common/queries/mijnmotor';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { Badge } from '$app/components/Badge';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSync, FaTimes } from 'react-icons/fa';
import { Icon } from '$app/components/icons/Icon';

interface Props {
  client: Client;
}

// Helper function to check if subscription is active
function isSubscriptionActive(periods: Period[]): boolean {
  const now = new Date();
  return periods.some(period => {
    const start = new Date(period.datePeriod.start);
    const end = new Date(period.datePeriod.end);
    return now >= start && now <= end;
  });
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function SubscriptionPeriods({ periods, expanded }: { periods: Period[]; expanded: boolean }) {
  const colors = useColorScheme();
  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(b.datePeriod.start).getTime() - new Date(a.datePeriod.start).getTime()
  );
  const displayPeriods = expanded ? sortedPeriods : sortedPeriods.slice(0, 2);
  
  return (
    <div className="flex flex-col space-y-1">
      {displayPeriods.map((period, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Badge variant="light-blue">{period.period}</Badge>
          {period.invoiceId ? (
            <Link
              to={`/invoices/${period.invoiceId}`}
              className="text-xs hover:underline"
              style={{ color: colors.$3 }}
            >
              {formatDate(period.datePeriod.start)} → {formatDate(period.datePeriod.end)}
            </Link>
          ) : (
            <span className="text-xs" style={{ color: colors.$3 }}>
              {formatDate(period.datePeriod.start)} → {formatDate(period.datePeriod.end)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function MijnMotor(props: Props) {
  const [t] = useTranslation();
  const { client } = props;
  const colors = useColorScheme();
  const isEnabled = useEnabled();
  const isMijnMotorEnabled = isEnabled(ModuleBitmask.MijnMotor);
  const [expandedSubscriptions, setExpandedSubscriptions] = useState<Set<string>>(new Set());

  const { data: subscriptions, isLoading } = useMijnMotorSubscriptionQuery({
    clientHashedId: client.id,
    enabled: isMijnMotorEnabled,
  });

  const toggleExpanded = (subscriptionName: string) => {
    const newExpanded = new Set(expandedSubscriptions);
    if (newExpanded.has(subscriptionName)) {
      newExpanded.delete(subscriptionName);
    } else {
      newExpanded.add(subscriptionName);
    }
    setExpandedSubscriptions(newExpanded);
  };

  if (!isMijnMotorEnabled) {
    return null;
  }

  const subscriptionEntries = Object.entries(subscriptions?.subscriptions || {});

  return (
    <InfoCard
      title={
        <div className="flex items-start gap-x-2 justify-between">
          <span className="text-xl font-medium">Abonnementen</span>
        </div>
      }
      className="h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-5 2xl:col-span-4 shadow-sm p-4"
      style={{ borderColor: colors.$24 }}
      withoutPadding
    >
      <div className="flex flex-col pt-1 space-y-4 h-44 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : subscriptionEntries.length > 0 ? (
          subscriptionEntries.map(([subscriptionName, subscription]) => {
            const isActive = isSubscriptionActive(subscription.periods);
            const isExpanded = expandedSubscriptions.has(subscriptionName);
            
            return (
              <div key={subscriptionName} className="flex flex-col space-y-3 pb-3 border-b border-dashed" style={{ borderColor: colors.$24 }}>
                {/* Subscription name and status badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold">{subscriptionName}</span>
                  <div className="flex gap-2">
                    <Badge variant={isActive ? 'green' : 'red'} className="w-fit text-xs">
                      {isActive ? 'Actief' : 'Verlopen'}
                    </Badge>
                    <Badge variant={subscription.is_renewed ? 'green' : 'red'} className="w-fit text-xs flex items-center gap-1">
                      <Icon element={subscription.is_renewed ? FaSync : FaTimes} size={12} color="currentColor" />
                      {subscription.renewal_status}
                    </Badge>
                  </div>
                </div>
                
                {/* Periods */}
                <div className="flex flex-col space-y-2">
                  <SubscriptionPeriods 
                    periods={subscription.periods} 
                    expanded={isExpanded}
                  />
                  {subscription.periods.length > 2 && (
                    <button
                      onClick={() => toggleExpanded(subscriptionName)}
                      className="text-xs hover:underline"
                      style={{ color: colors.$17 }}
                    >
                      {isExpanded ? 'Toon minder' : (
                        <>
                          ...<br />Toon meer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <span
              className="text-sm font-medium"
              style={{ color: colors.$17 }}
            >
              {t('no_subscription_found')}
            </span>
          </div>
        )}
      </div>
    </InfoCard>
  );
}
