// styles/pdfStyles.ts
import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    flex: 1,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 100,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingVertical: 2,
    fontSize: 9,
  },
  date: {
    width: 80,
  },
  method: {
    width: 120,
  },
  amount: {
    width: 80,
    textAlign: 'right',
  },
  description: {
    flex: 1,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },
  totalBox: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});
