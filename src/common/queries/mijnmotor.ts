import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';

export interface DatePeriod {
  start: string;
  end: string;
}

export interface Period {
  period: string;
  datePeriod: DatePeriod;
  invoiceId: string;
  additionalSubscriptionId: string | null;
}

export interface Subscription {
  periods: Period[];
  renewal_status: string;
  is_renewed: boolean;
  is_renewed_automatically: boolean;
}

export interface MijnMotorSubscriptions {
  subscriptions: Record<string, Subscription>;
}

interface Props {
  clientHashedId: string;
  enabled?: boolean;
}

export function useMijnMotorSubscriptionQuery({ clientHashedId, enabled }: Props) {
  return useQuery(
    ['/api/v1/mijnmotor/subscriptions', clientHashedId],
    () =>
      request(
        'GET',
        endpoint('/api/v1/mijnmotor/subscriptions/:client_hashed_id', {
          client_hashed_id: clientHashedId,
        })
      ).then((response): MijnMotorSubscriptions => {
        return response.data;
      }),
    {
      enabled: enabled && Boolean(clientHashedId),
      staleTime: Infinity,
      retry: false,
    }
  );
}
