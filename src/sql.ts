// @ts-ignore
import IgniteClient from 'apache-ignite-client';

let queryEntity = IgniteClient.QueryEntity;
let QueryField = IgniteClient.QueryField;
const objectType = IgniteClient.ObjectType;
const complexObjectType = IgniteClient.ComplexObjectType;
const cacheEntry = IgniteClient.CacheEntry;
const sqlQuery = IgniteClient.SqlQuery;

export async function initSQL(config: any) {
    config.setQueryEntities(
        new queryEntity().
            setValueTypeName('Person').
            setFields([
                new QueryField('name', 'java.lang.String'),
                new QueryField('salary', 'java.lang.Double')
            ]));
    return config;
}

export async function initTables(cache: any) {
    cache.
        setKeyType(objectType.PRIMITIVE_TYPE.INTEGER).
        setValueType(new complexObjectType({ 'name': '', 'salary': 0 }, 'Person'));

}

export async function insertSQL(cache: any, name: string, salary: number) {
    await cache.put(new cacheEntry(1, { 'name': name, 'salary': salary }))
}

export async function getSQL(cache: any, salaryLow: number, salaryHigh: number) {
    const salaryQuery = new sqlQuery('Person', 'salary > ? and salary <= ?').
        setArgs(salaryLow, salaryHigh);

    const cursor = await cache.query(sqlQuery);

    for (let cacheEntry of await cursor.getAll()) {
        console.log(cacheEntry.getValue());
    }
}