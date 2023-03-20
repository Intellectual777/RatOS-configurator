import React, { Fragment, useCallback, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../../helpers/classNames';

type Option = {
	id: number | string;
	name: string;
};

interface DropdownProps {
	options: Option[];
	initialValue?: Option;
	onSelect?: (option: Option) => void;
	label: string;
}

export const Dropdown: React.FC<DropdownProps> = (props) => {
	const { onSelect } = props;
	const [selected, setSelected] = useState<Option | undefined>(props.options[0]);

	const onSelected = useCallback(
		(newSelection) => {
			setSelected(newSelection);
			onSelect?.(newSelection);
		},
		[onSelect],
	);

	const options = props.options.slice(0).sort((a, b) => a.name.localeCompare(b.name));

	return (
		<Listbox value={selected} onChange={onSelected}>
			{({ open }) => (
				<>
					<Listbox.Label className="block text-sm font-semibold leading-6 text-gray-900">{props.label}</Listbox.Label>
					<div className="relative mt-1">
						<Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6">
							<span className="block truncate">{selected?.name ?? 'Pick from the list...'}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								{options.length === 0 && <div className="text-gray-400 text-sm px-3 py-2">No options available</div>}
								{options.map((option) => (
									<Listbox.Option
										key={option.id}
										className={({ active }) =>
											classNames(
												active ? 'bg-brand-600 text-white' : 'text-gray-900',
												'relative cursor-default select-none py-2 pl-3 pr-9',
											)
										}
										value={option}
									>
										{({ selected, active }) => (
											<>
												<span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
													{option.name}
												</span>

												{selected ? (
													<span
														className={classNames(
															active ? 'text-white' : 'text-brand-600',
															'absolute inset-y-0 right-0 flex items-center pr-4',
														)}
													>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};