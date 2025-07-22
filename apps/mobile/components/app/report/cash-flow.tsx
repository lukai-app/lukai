import { View, ScrollView, StyleSheet } from 'react-native';

import DayjsSingleton from '@/lib/Dayjs';

import { Text } from '@/components/ui/text';

interface CashFlowProps {
  data: Array<{
    month: number;
    income: number;
    expenses: number;
    flow: number;
    accumulated: number;
  }>;
  currency: string;
  locale: string;
}

export const CashFlow = (props: CashFlowProps) => {
  const { data, currency, locale } = props;
  const dayjs = DayjsSingleton.getInstance(locale);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const TableHeader = ({ month }: { month: number }) => (
    <View style={styles.headerCell}>
      <Text
        style={{
          color: '#9CA3AF',
          fontSize: 12,
          textAlign: 'right',
          fontFamily: 'Nunito_400Regular',
        }}
      >
        {dayjs().month(Number(month)).format('MMM')}
      </Text>
    </View>
  );

  const TableCell = ({
    value,
    isFlow,
  }: {
    value: number | null;
    isFlow?: boolean;
  }) => (
    <View style={styles.cell}>
      <Text
        style={[
          styles.cellText,
          isFlow && value
            ? value < 0
              ? { color: '#F37212' }
              : { color: '#2EB88A' }
            : undefined,
        ]}
      >
        {value ? formatCurrency(value) : '-'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text
        className="text-[#9CA3AF] mb-1"
        style={{
          fontFamily: 'Nunito_600SemiBold',
        }}
      >
        flujo de caja
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Headers */}
          <View style={styles.row}>
            <View style={styles.labelCell} />
            {data.map((item) => (
              <TableHeader key={item.month} month={item.month} />
            ))}
          </View>

          {/* Income Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>ingresos</Text>
            </View>
            {data.map((item) => (
              <TableCell key={item.month} value={item.income} />
            ))}
          </View>

          {/* Expenses Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>gastos</Text>
            </View>
            {data.map((item) => (
              <TableCell key={item.month} value={item.expenses} />
            ))}
          </View>

          {/* Cash Flow Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>flujo de caja</Text>
            </View>
            {data.map((item) => (
              <TableCell key={item.month} value={item.flow} isFlow />
            ))}
          </View>

          {/* Accumulated Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={[styles.labelText, styles.boldText]}>
                flujo acumulado
              </Text>
            </View>
            {data.map((item) => (
              <TableCell key={item.month} value={item.accumulated} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_600SemiBold',
    color: 'white',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  labelCell: {
    width: 120,
    padding: 16,
    justifyContent: 'center',
  },
  labelText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  headerCell: {
    width: 120,
    padding: 16,
    justifyContent: 'center',
  },
  cell: {
    width: 120,
    padding: 16,
    justifyContent: 'center',
  },
  cellText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'right',
    fontFamily: 'Nunito_400Regular',
  },
  boldText: {
    fontFamily: 'Nunito_600SemiBold',
  },
});
