package model

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name     string `gorm:"not null;unique"`
	Password string `gorm:"not null"`
}
