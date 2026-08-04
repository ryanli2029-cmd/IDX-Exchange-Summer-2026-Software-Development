import { render, screen, fireEvent } from '@testing-library/react';
import Pagination, { getPageRange } from './Pagination';

describe('Pagination Component', () => {
  test('returns null when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders previous/next buttons and page numbers correctly', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByText('« Previous')).toBeInTheDocument();
    expect(screen.getByText('Next »')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('disables Previous on first page and Next on last page', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByText('« Previous')).toBeDisabled();
    expect(screen.getByText('Next »')).not.toBeDisabled();

    rerender(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('« Previous')).not.toBeDisabled();
    expect(screen.getByText('Next »')).toBeDisabled();
  });

  test('calls onPageChange with correct page when clicked', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />
    );

    fireEvent.click(screen.getByText('3'));
    expect(handlePageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByText('Next »'));
    expect(handlePageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByText('« Previous'));
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  test('🐛 Debug Challenge Fix: generates correct range without duplicate end numbers', () => {
    // Testing near end of range (e.g., page 23 of 24)
    const rangeNearEnd = getPageRange(23, 24);
    
    // Check that '1' and '24' appear exactly once
    const countOfLastPage = rangeNearEnd.filter((p) => p === 24).length;
    expect(countOfLastPage).toBe(1);

    expect(rangeNearEnd).toEqual([1, '...', 22, 23, 24]);
  });

  test('renders ellipsis correctly for large page counts in middle page', () => {
    const range = getPageRange(10, 20);
    expect(range).toEqual([1, '...', 9, 10, 11, '...', 20]);
  });
});