import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { Job_Locations } from '@/utils/constant'
import { RefreshCcw } from 'lucide-react'

const filterData = [
    {
        filterType: "state",
        array: Job_Locations["states"],
        initialVisibleItems: 5
    },
    {
        filterType: "industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"].map((industry, index) => ({ id: index, name: industry })),
        initialVisibleItems: 3
    },
    {
        filterType: "salary",
        array: ["0-1000DT", "1000-2000DT", "2000-5000DT"].map((salary, index) => ({ id: index, name: salary })),
        initialVisibleItems: 3
    },
]

const FilterCard = () => {
    const [selectedValues, setSelectedValues] = useState({
        state: '',
        industry: '',
        salary: ''
    });
    const [expandedFilterTypes, setExpandedFilterTypes] = useState({});
    const dispatch = useDispatch();

    const changeHandler = (filterType, value) => {
        setSelectedValues(prev => ({
            ...prev,
            [filterType]: value
          }));
    }

    const resetFilters = () => {
        setSelectedValues({
            state: '',
            industry: '',
            salary: ''
        });
        setExpandedFilterTypes({});
    }

    const toggleFilterTypeExpand = (filterType) => {
        setExpandedFilterTypes(prev => ({
            ...prev,
            [filterType]: !prev[filterType]
        }));
    }

    useEffect(() => {  
        dispatch(setSearchedQuery(selectedValues));
    }, [selectedValues, dispatch]);

    return (
        <div className='w-full bg-white p-4 rounded-lg shadow-sm border'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='font-bold text-xl text-gray-800'>Filter Jobs</h1>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className='hover:bg-gray-100'
                >
                    <RefreshCcw className='mr-2 h-4 w-4' /> Reset
                </Button>
            </div>
            <hr className='mb-4' />
            {filterData.map((data, index) => {
                const isExpanded = expandedFilterTypes[data.filterType];
                const visibleItems = isExpanded ? data.array : data.array.slice(0, data.initialVisibleItems);

                return (
                    <div key={data.filterType} className='mb-6'>
                        <div className='flex justify-between items-center mb-3'>
                            <h2 className='font-semibold text-md text-gray-700'>
                                {data.filterType}
                            </h2>
                            {data.array.length > data.initialVisibleItems && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFilterTypeExpand(data.filterType)}
                                    className='text-blue-600 hover:text-blue-800'
                                >
                                    {isExpanded ? 'Collapse' : `Show All (${data.array.length})`}
                                </Button>
                            )}
                        </div>
                        <div className='space-y-2 grid grid-cols-2 gap-x-4 gap-y-2'>
                            {visibleItems.map((item, idx) => {
                                const itemId = `id${index}-${idx}`;
                                return (
                                    <div 
                                        key={itemId} 
                                        className='flex items-center space-x-2'
                                    >
                                        <input 
                                            type="checkbox" 
                                            value={item.name} 
                                            id={itemId} 
                                            className='hover:bg-gray-100'
                                            onChange={(e) => changeHandler(data.filterType, e.target.checked ? item.name : '')}
                                            checked={selectedValues[data.filterType] === item.name}
                                        />
                                        <Label 
                                            htmlFor={itemId} 
                                            className='text-gray-600 hover:text-gray-800 cursor-pointer'
                                        >
                                            {item.name}
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default FilterCard