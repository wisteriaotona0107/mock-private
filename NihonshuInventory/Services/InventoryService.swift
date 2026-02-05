import Foundation

enum InventoryError: LocalizedError {
    case emptyName
    case duplicateSakeName
    case invalidBottleSize
    case invalidRemaining
    case stockUnderflow
    case stockOverflow
    case sakeHasLots

    var errorDescription: String? {
        switch self {
        case .emptyName:
            return "銘柄名を入力してください。"
        case .duplicateSakeName:
            return "同名の銘柄が既に存在します。"
        case .invalidBottleSize:
            return "容量は1以上で入力してください。"
        case .invalidRemaining:
            return "残量は0以上かつ容量以下で入力してください。"
        case .stockUnderflow:
            return "残量が不足しています。"
        case .stockOverflow:
            return "容量を超えるため更新できません。"
        case .sakeHasLots:
            return "在庫が紐づくため、この銘柄は削除できません。"
        }
    }
}

enum InventoryService {
    static func validateSakeName(_ name: String, existingNames: [String], currentName: String? = nil) throws {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw InventoryError.emptyName }

        let isDuplicate = existingNames.contains {
            $0.caseInsensitiveCompare(trimmed) == .orderedSame &&
            $0.caseInsensitiveCompare(currentName ?? "") != .orderedSame
        }
        if isDuplicate {
            throw InventoryError.duplicateSakeName
        }
    }

    static func validateLot(bottleSizeMl: Int, remainingMl: Int) throws {
        guard bottleSizeMl > 0 else { throw InventoryError.invalidBottleSize }
        guard (0...bottleSizeMl).contains(remainingMl) else {
            throw InventoryError.invalidRemaining
        }
    }

    static func applyIn(lot: StockLot, amountMl: Int, note: String?) throws {
        guard lot.remainingMl + amountMl <= lot.bottleSizeMl else { throw InventoryError.stockOverflow }
        lot.remainingMl += amountMl
        lot.updatedAt = .now
        lot.events.append(StockEvent(lot: lot, kind: "in", deltaMl: amountMl, note: note))
    }

    static func applyOut(lot: StockLot, amountMl: Int, note: String?) throws {
        guard lot.remainingMl - amountMl >= 0 else { throw InventoryError.stockUnderflow }
        lot.remainingMl -= amountMl
        lot.updatedAt = .now
        lot.events.append(StockEvent(lot: lot, kind: "out", deltaMl: -amountMl, note: note))
    }

    static func applyAdjust(lot: StockLot, to newRemainingMl: Int, note: String?) throws {
        guard (0...lot.bottleSizeMl).contains(newRemainingMl) else { throw InventoryError.invalidRemaining }
        let delta = newRemainingMl - lot.remainingMl
        lot.remainingMl = newRemainingMl
        lot.updatedAt = .now
        lot.events.append(StockEvent(lot: lot, kind: "adjust", deltaMl: delta, note: note))
    }

    static func canDeleteSake(_ sake: Sake) -> Bool {
        sake.lots.isEmpty
    }
}
