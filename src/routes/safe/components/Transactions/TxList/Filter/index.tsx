import { ReactElement, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ClickAwayListener from '@material-ui/core/ClickAwayListener/ClickAwayListener'
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup'
import Radio from '@material-ui/core/Radio/Radio'
import Paper from '@material-ui/core/Paper/Paper'
import FormControl from '@material-ui/core/FormControl/FormControl'
import FormLabel from '@material-ui/core/FormLabel/FormLabel'
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel'
import type { SettingsInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import Button from 'src/components/layout/Button'
import RHFTextField from 'src/components/forms/RHF/RHFTextField'
import RHFAddressSearchField from 'src/components/forms/RHF/RHFAddressSearchField'
import RHFModuleSearchField from 'src/routes/safe/components/Transactions/TxList/Filter/RHFModuleSearchField'
import BackdropLayout from 'src/components/layout/Backdrop'
import { isValidAddress } from 'src/utils/isValidAddress'
import filterIcon from 'src/routes/safe/components/Transactions/TxList/assets/filter-icon.svg'

import { lg, md, primary300, grey400, largeFontSize, primary200, sm } from 'src/theme/variables'

enum FilterType {
  INCOMING = 'Incoming',
  MODULE = 'Module',
  MULTISIG = 'Multisignature',
}

// Types cannot take computed property names
const TYPE_FIELD_NAME = 'type'
const FROM_FIELD_NAME = 'from'
const TO_FIELD_NAME = 'to'
const RECIPIENT_FIELD_NAME = 'recipient'
const AMOUNT_FIELD_NAME = 'amount'
const TOKEN_ADDRESS_FIELD_NAME = 'tokenAddress'
const MODULE_FIELD_NAME = 'module'
const NONCE_FIELD_NAME = 'nonce'

type FilterForm = {
  [TYPE_FIELD_NAME]: FilterType
  [FROM_FIELD_NAME]: string
  [TO_FIELD_NAME]: string
  [RECIPIENT_FIELD_NAME]: string
  [AMOUNT_FIELD_NAME]: string
  [TOKEN_ADDRESS_FIELD_NAME]: string
  [MODULE_FIELD_NAME]: SettingsInfo['type']
  [NONCE_FIELD_NAME]: string
}

const isValidAmount = (value: FilterForm['amount']): string | undefined => {
  if (value && isNaN(Number(value))) {
    return 'Invalid number'
  }
}

const isValidTokenAddress = (value: FilterForm['tokenAddress']): string | undefined => {
  if (value && !isValidAddress(value)) {
    return 'Invalid address'
  }
}

const isValidNonce = (value: FilterForm['nonce']): string | undefined => {
  if (value.length === 0) {
    return
  }

  const number = Number(value)
  if (isNaN(number)) {
    return 'Invalid number'
  }
  if (number < 0) {
    return 'Nonce cannot be negative'
  }
}

const Filter = (): ReactElement => {
  const [showFilter, setShowFilter] = useState<boolean>(true)

  const onClickAway = () => setShowFilter(false)

  const toggleFilter = () => setShowFilter((prev) => !prev)

  const { handleSubmit, formState, reset, watch, control } = useForm<FilterForm>({
    defaultValues: {
      [TYPE_FIELD_NAME]: FilterType.INCOMING,
      [FROM_FIELD_NAME]: '',
      [TO_FIELD_NAME]: '',
      [RECIPIENT_FIELD_NAME]: '',
      [AMOUNT_FIELD_NAME]: '',
      [TOKEN_ADDRESS_FIELD_NAME]: '',
      [MODULE_FIELD_NAME]: undefined,
      [NONCE_FIELD_NAME]: '',
    },
    shouldUnregister: true, // Remove values of unmounted inputs
  })

  const type = watch(TYPE_FIELD_NAME)

  const isClearable = Object.entries(formState.dirtyFields).some(([name, value]) => value && name !== TYPE_FIELD_NAME)

  const onClear = () => {
    reset({ type })
  }

  const onSubmit = ({ type: _, ...rest }: FilterForm) => {
    const filter = Object.fromEntries(Object.entries(rest).filter(([, value]) => Boolean(value)))
    console.log(filter)
  }

  return (
    <>
      <BackdropLayout isOpen={showFilter} />
      <ClickAwayListener onClickAway={onClickAway}>
        <Wrapper>
          <StyledFilterButton onClick={toggleFilter} variant="contained" color="primary" disableElevation>
            <StyledFilterIconImage src={filterIcon} /> Filters{' '}
            {showFilter ? <ExpandLessIcon color="secondary" /> : <ExpandMoreIcon color="secondary" />}
          </StyledFilterButton>
          {showFilter && (
            <StyledPaper elevation={0} variant="outlined">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FilterWrapper>
                  <StyledTxTypeFormControl>
                    <StyledFormLabel>Transaction type</StyledFormLabel>
                    <Controller
                      name={TYPE_FIELD_NAME}
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          {Object.values(FilterType).map((value) => (
                            <StyledRadioFormControlLabel value={value} control={<Radio />} label={value} key={value} />
                          ))}
                        </RadioGroup>
                      )}
                    />
                  </StyledTxTypeFormControl>
                  <ParamsFormControl>
                    <StyledFormLabel>Parameters</StyledFormLabel>
                    <ParametersFormWrapper>
                      <RHFTextField name={FROM_FIELD_NAME} label="From" type="date" control={control} />
                      <RHFTextField name={TO_FIELD_NAME} label="To" type="date" control={control} />
                      <RHFAddressSearchField name={RECIPIENT_FIELD_NAME} label="Recipient" control={control} />
                      {[FilterType.INCOMING, FilterType.MULTISIG].includes(type) && (
                        <>
                          <RHFTextField
                            name={AMOUNT_FIELD_NAME}
                            label="Amount"
                            control={control}
                            rules={{
                              validate: isValidAmount,
                            }}
                          />
                          {type === FilterType.INCOMING && (
                            <RHFTextField
                              name={TOKEN_ADDRESS_FIELD_NAME}
                              label="Token Address"
                              control={control}
                              rules={{
                                validate: isValidTokenAddress,
                              }}
                            />
                          )}
                          {type === FilterType.MULTISIG && (
                            <RHFTextField
                              name={NONCE_FIELD_NAME}
                              label="Nonce"
                              control={control}
                              rules={{
                                validate: isValidNonce,
                              }}
                            />
                          )}
                        </>
                      )}
                      {type === FilterType.MODULE && (
                        <RHFModuleSearchField name={MODULE_FIELD_NAME} label="Module" control={control} />
                      )}
                    </ParametersFormWrapper>
                    <ButtonWrapper>
                      <Button type="submit" variant="contained" disabled={!isClearable} color="primary">
                        Apply
                      </Button>
                      <Button variant="contained" onClick={onClear} disabled={!isClearable} color="gray">
                        Clear
                      </Button>
                    </ButtonWrapper>
                  </ParamsFormControl>
                </FilterWrapper>
              </form>
            </StyledPaper>
          )}
        </Wrapper>
      </ClickAwayListener>
    </>
  )
}

export default Filter

const StyledFilterButton = styled(Button)`
  &.MuiButton-root {
    align-items: center;
    background-color: ${primary200};
    border: 2px solid ${primary300};
    color: #162d45;
    align-self: flex-end;
    margin-right: ${md};
    margin-top: -51px;
    margin-bottom: ${md};
    &:hover {
      background-color: ${primary200};
    }
  }
`

const StyledFilterIconImage = styled.img`
  margin-right: ${sm};
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  width: 100%;
`

const StyledPaper = styled(Paper)`
  border: 2px solid ${primary300};
  position: absolute;
  width: calc(100% - 30px);
  margin-left: 10px;
  top: 0;
  left: 0;
`

const FilterWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: ${lg};
`

const StyledTxTypeFormControl = styled(FormControl)`
  &.MuiFormControl-root {
    box-sizing: border-box;
    padding: ${lg};
    border-right: 2px solid ${grey400}; // Divider
  }
`

const StyledFormLabel = styled(FormLabel)`
  &.MuiFormLabel-root {
    margin-bottom: ${lg};
    font-size: 12px;
    color: #b2bbc0;
  }
`

const StyledRadioFormControlLabel = styled(FormControlLabel)`
  .MuiFormControlLabel-root {
    font-size: ${largeFontSize};
  }
`

const ParamsFormControl = styled(FormControl)`
  &.MuiFormControl-root {
    box-sizing: border-box;
    padding: ${lg} 128px ${lg} ${lg};
  }
`

const ParametersFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 26px;
`

const ButtonWrapper = styled.div`
  grid-column: span 2;
  margin-top: 36px;
  display: grid;
  grid-template-columns: 100px 100px;
  gap: ${md};
`
