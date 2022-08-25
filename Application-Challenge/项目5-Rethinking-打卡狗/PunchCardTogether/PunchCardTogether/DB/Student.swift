//
//  Student.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/11.
//

import Foundation
import GRDB
import Combine

enum StudentGender: String, Codable {
    case male
    case female
}

struct Student: Codable {
    var id: Int64?
    var name: String
    var gender: StudentGender
    
    enum Columns {
        static let name = Column(CodingKeys.name)
        static let gender = Column(CodingKeys.gender)
    }
}

extension Student: FetchableRecord, MutablePersistableRecord, TableRecord {
    static let databaseTableName: String = "student"
    
    mutating func didInsert(with rowID: Int64, for column: String?) {
        id = rowID
    }
}

struct StudentRequest: Queryable {
    enum Ordering {
        case byScore
        case byName
    }
    
    var ordering: Ordering
    
    static var defaultValue: [Student] {
        []
    }
    
    func publisher(in database: AppDatabase) -> AnyPublisher<[Student], Error> {
        ValueObservation.tracking(fetchValue(_:)).publisher(in: database.databaseReader).eraseToAnyPublisher()
    }
    
    func fetchValue(_ db: Database) throws -> [Student] {
        switch ordering {
        case .byScore:
            return try Student.all().orderByName().fetchAll(db)
        case .byName:
            return try Student.all().orderByName().fetchAll(db)
        }
    }
}

extension DerivableRequest where RowDecoder == Student {
    func orderByName() -> Self {
        order(Student.Columns.name.collating(.caseInsensitiveCompare))
    }
}
