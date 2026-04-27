import { Element } from '$app/components/cards';
import { InputField, Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useState } from 'react';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';

export function MijnMotor() {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [isTestingBusy, setIsTestingBusy] = useState<boolean>(false);

  const handleTestToken = () => {
    if (!isTestingBusy) {
      toast.processing();
      setIsTestingBusy(true);

      request('POST', endpoint('/api/v1/mijnmotor/test_token'), {
        mijnmotor_oauth_domain: companyChanges?.settings?.mijnmotor_oauth_domain || '',
        mijnmotor_oauth_client_identifier: companyChanges?.settings?.mijnmotor_oauth_client_identifier || '',
        mijnmotor_oauth_client_secret: companyChanges?.settings?.mijnmotor_oauth_client_secret || '',
      })
        .then((response) => toast.success(response.data.message))
        .catch((error) => toast.error(error.response?.data?.message || t('error')))
        .finally(() => setIsTestingBusy(false));
    }
  };

  return (
    <div className="flex flex-col space-y-4 pt-2 pb-4">
      <h3 className="leading-6 font-medium text-lg px-4 sm:px-6">MijnMotor</h3>

      <Element leftSide={t('mijnmotor_oauth_domain')}>
        <InputField
          value={companyChanges?.settings?.mijnmotor_oauth_domain || ''}
          onValueChange={(value) =>
            handleChange('settings.mijnmotor_oauth_domain', value)
          }
          errorMessage={errors?.errors?.['settings.mijnmotor_oauth_domain']}
        />
      </Element>

      <Element leftSide={t('mijnmotor_oauth_client_identifier')}>
        <InputField
          value={companyChanges?.settings?.mijnmotor_oauth_client_identifier || ''}
          onValueChange={(value) =>
            handleChange('settings.mijnmotor_oauth_client_identifier', value)
          }
          errorMessage={errors?.errors?.['settings.mijnmotor_oauth_client_identifier']}
        />
      </Element>

      <Element leftSide={t('mijnmotor_oauth_client_secret')}>
        <InputField
          type="password"
          value={companyChanges?.settings?.mijnmotor_oauth_client_secret || ''}
          onValueChange={(value) =>
            handleChange('settings.mijnmotor_oauth_client_secret', value)
          }
          errorMessage={errors?.errors?.['settings.mijnmotor_oauth_client_secret']}
        />
      </Element>

      <Element pushContentToRight>
        <Button
          behavior="button"
          onClick={handleTestToken}
          disableWithoutIcon
          disabled={isTestingBusy}
        >
          {t('test_configuration')}
        </Button>
      </Element>
    </div>
  );
}
